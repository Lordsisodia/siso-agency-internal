import { z } from 'zod';

export type MiddlewareFunction = (data: any, context: MiddlewareContext) => Promise<any>;

export interface MiddlewareContext {
  mcp: string;
  method: string;
  direction: 'pre' | 'post';
  metadata?: Record<string, any>;
}

export interface ValidationSchema {
  pre?: z.ZodSchema;
  post?: z.ZodSchema;
}

/**
 * MCP Middleware Manager for validation and transformation
 */
export class MCPMiddleware {
  private preProcessors: Map<string, MiddlewareFunction[]> = new Map();
  private postProcessors: Map<string, MiddlewareFunction[]> = new Map();
  private validationSchemas: Map<string, ValidationSchema> = new Map();

  constructor() {
    this.initializeDefaultMiddleware();
  }

  /**
   * Initialize default middleware for common MCPs
   */
  private initializeDefaultMiddleware(): void {
    // Supabase middleware
    this.addPreProcessor('supabase', this.sanitizeSQL);
    this.addPreProcessor('supabase', this.checkReadOnly);
    this.addPostProcessor('supabase', this.maskSensitiveData);

    // Context7 middleware
    this.addPreProcessor('context7', this.resolveLibraryAlias);
    this.addPreProcessor('context7', this.validateTokenLimit);
    this.addPostProcessor('context7', this.formatDocumentation);

    // Exa middleware
    this.addPreProcessor('exa', this.sanitizeSearchQuery);
    this.addPostProcessor('exa', this.filterAndRankResults);

    // Notion middleware
    this.addPreProcessor('notion', this.validateNotionParams);
    this.addPostProcessor('notion', this.formatNotionContent);

    // GitHub middleware
    this.addPreProcessor('github', this.validateGitHubParams);
    this.addPreProcessor('github', this.checkBranchProtection);

    // Desktop Commander middleware
    this.addPreProcessor('desktop-commander', this.validatePaths);
    this.addPreProcessor('desktop-commander', this.checkBlockedCommands);
    this.addPreProcessor('desktop-commander', this.enforceExecPolicy);

    this.initializeValidationSchemas();
  }

  /**
   * Initialize validation schemas
   */
  private initializeValidationSchemas(): void {
    // Supabase schemas
    this.setValidationSchema('supabase.executeSql', {
      pre: z.object({
        query: z.string().min(1),
        projectId: z.string().optional(),
        params: z.record(z.any()).optional()
      }),
      post: z.array(z.record(z.any()))
    });

    // Context7 schemas
    this.setValidationSchema('context7.resolveLibraryId', {
      pre: z.object({
        libraryName: z.string().min(1)
      }),
      post: z.object({
        libraryId: z.string()
      })
    });

    this.setValidationSchema('context7.getLibraryDocs', {
      pre: z.object({
        libraryId: z.string().min(1),
        topic: z.string().optional(),
        tokens: z.number().min(1000).max(50000).default(10000)
      }),
      post: z.object({
        content: z.string(),
        libraryId: z.string().optional(),
        tokens: z.number().optional()
      })
    });

    // Notion schemas
    this.setValidationSchema('notion.createPage', {
      pre: z.object({
        parentId: z.string(),
        parentType: z.enum(['page', 'database']),
        title: z.string().min(1),
        content: z.string().optional(),
        properties: z.record(z.any()).optional()
      })
    });

    // GitHub schemas
    this.setValidationSchema('github.createBranch', {
      pre: z.object({
        branchName: z.string().regex(/^[a-zA-Z0-9\-_\/]+$/),
        baseBranch: z.string().default('main')
      })
    });

    // Desktop Commander schemas
    this.setValidationSchema('desktop-commander.runCommand', {
      pre: z.object({
        command: z.string().min(1),
        args: z.array(z.string()).optional(),
        cwd: z.string().optional(),
        timeoutMs: z.number().min(100).max(60000).optional(),
        confirm: z.boolean().optional()
      })
    });
    this.setValidationSchema('desktop-commander.runNodeCode', {
      pre: z.object({
        code: z.string().min(1).max(4000),
        cwd: z.string().optional(),
        timeoutMs: z.number().min(100).max(60000).optional(),
        confirm: z.boolean().optional()
      })
    });
    this.setValidationSchema('desktop-commander.runPythonCode', {
      pre: z.object({
        code: z.string().min(1).max(4000),
        python: z.string().optional(),
        cwd: z.string().optional(),
        timeoutMs: z.number().min(100).max(60000).optional(),
        confirm: z.boolean().optional()
      })
    });
    this.setValidationSchema('desktop-commander.runScriptFile', {
      pre: z.object({
        path: z.string().min(1),
        args: z.array(z.string()).optional(),
        interpreter: z.enum(['bash', 'zsh', 'sh', 'node', 'python3', 'python']).optional(),
        cwd: z.string().optional(),
        timeoutMs: z.number().min(100).max(60000).optional(),
        confirm: z.boolean().optional()
      })
    });
  }

  /**
   * Add pre-processor middleware
   */
  addPreProcessor(mcp: string, fn: MiddlewareFunction): void {
    if (!this.preProcessors.has(mcp)) {
      this.preProcessors.set(mcp, []);
    }
    this.preProcessors.get(mcp)!.push(fn);
  }

  /**
   * Add post-processor middleware
   */
  addPostProcessor(mcp: string, fn: MiddlewareFunction): void {
    if (!this.postProcessors.has(mcp)) {
      this.postProcessors.set(mcp, []);
    }
    this.postProcessors.get(mcp)!.push(fn);
  }

  /**
   * Set validation schema
   */
  setValidationSchema(key: string, schema: ValidationSchema): void {
    this.validationSchemas.set(key, schema);
  }

  /**
   * Apply pre-processing middleware
   */
  async preProcess(mcp: string, method: string, data: any): Promise<any> {
    let processedData = data;
    const context: MiddlewareContext = { mcp, method, direction: 'pre' };

    // Apply validation
    const schemaKey = `${mcp}.${method}`;
    const schema = this.validationSchemas.get(schemaKey);
    if (schema?.pre) {
      processedData = schema.pre.parse(processedData);
    }

    // Apply middleware functions
    const processors = this.preProcessors.get(mcp) || [];
    for (const processor of processors) {
      processedData = await processor(processedData, context);
    }

    return processedData;
  }

  /**
   * Apply post-processing middleware
   */
  async postProcess(mcp: string, method: string, data: any): Promise<any> {
    let processedData = data;
    const context: MiddlewareContext = { mcp, method, direction: 'post' };

    // Apply middleware functions
    const processors = this.postProcessors.get(mcp) || [];
    for (const processor of processors) {
      processedData = await processor(processedData, context);
    }

    // Apply validation
    const schemaKey = `${mcp}.${method}`;
    const schema = this.validationSchemas.get(schemaKey);
    if (schema?.post) {
      processedData = schema.post.parse(processedData);
    }

    return processedData;
  }

  /**
   * Default middleware functions
   */

  private sanitizeSQL: MiddlewareFunction = async (data, context) => {
    if (data.query && typeof data.query === 'string') {
      // Basic SQL injection prevention
      const dangerousPatterns = [
        /DROP\s+TABLE/i,
        /DELETE\s+FROM\s+\*/i,
        /TRUNCATE/i,
        /ALTER\s+TABLE.*DROP/i
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(data.query)) {
          throw new Error(`Potentially dangerous SQL detected: ${pattern}`);
        }
      }
    }
    return data;
  };

  private checkReadOnly: MiddlewareFunction = async (data, context) => {
    const isReadOnly = (context as any)?.metadata?.readOnly ?? !!data?.readOnly;
    if (isReadOnly && data.query) {
      const writePatterns = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)/i;
      if (writePatterns.test(data.query)) {
        throw new Error('Write operations not allowed in read-only mode');
      }
    }
    return data;
  };

  private maskSensitiveData: MiddlewareFunction = async (data, context) => {
    if (Array.isArray(data)) {
      return data.map(row => {
        const masked = { ...row };
        // Mask sensitive fields
        ['password', 'api_key', 'secret', 'token'].forEach(field => {
          if (masked[field]) {
            masked[field] = '***MASKED***';
          }
        });
        return masked;
      });
    }
    return data;
  };

  private resolveLibraryAlias: MiddlewareFunction = async (data, context) => {
    const aliases: Record<string, string> = {
      'nextjs': 'next.js',
      'nodejs': 'node.js',
      'react-native': 'react native',
      'tailwindcss': 'tailwind css',
      'typescript': 'TypeScript'
    };

    if (data.libraryName && aliases[data.libraryName.toLowerCase()]) {
      data.libraryName = aliases[data.libraryName.toLowerCase()];
    }

    return data;
  };

  private validateTokenLimit: MiddlewareFunction = async (data, context) => {
    if (data.tokens && data.tokens < 10000) {
      data.tokens = 10000; // Minimum token limit
    }
    if (data.tokens && data.tokens > 50000) {
      data.tokens = 50000; // Maximum token limit
    }
    return data;
  };

  private formatDocumentation: MiddlewareFunction = async (data, context) => {
    if (data.content) {
      // Add helpful formatting
      data.formatted = {
        ...data,
        sections: this.extractSections(data.content),
        codeBlocks: this.extractCodeBlocks(data.content)
      };
    }
    return data;
  };

  private sanitizeSearchQuery: MiddlewareFunction = async (data, context) => {
    if (data.query) {
      // Remove special characters that might break search
      data.query = data.query
        .replace(/[<>]/g, '')
        .trim();
    }
    return data;
  };

  private filterAndRankResults: MiddlewareFunction = async (data, context) => {
    if (Array.isArray(data)) {
      // Sort by relevance score if available
      return data
        .filter(item => item.score > 0.5) // Filter low relevance
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    return data;
  };

  private validateNotionParams: MiddlewareFunction = async (data, context) => {
    // Ensure proper Notion ID format
    if (data.parentId && !data.parentId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)) {
      throw new Error('Invalid Notion ID format');
    }
    return data;
  };

  private formatNotionContent: MiddlewareFunction = async (data, context) => {
    // Format Notion response for easier consumption
    if (data.results) {
      data.formatted = data.results.map((item: any) => ({
        id: item.id,
        title: this.extractNotionTitle(item),
        type: item.object,
        lastEdited: item.last_edited_time,
        url: item.url
      }));
    }
    return data;
  };

  private validateGitHubParams: MiddlewareFunction = async (data, context) => {
    // Validate repository names
    if (data.repo && !data.repo.match(/^[a-zA-Z0-9\-_.]+$/)) {
      throw new Error('Invalid repository name');
    }
    return data;
  };

  private checkBranchProtection: MiddlewareFunction = async (data, context) => {
    const protectedBranches = ['main', 'master', 'production'];
    if (context.method === 'push' && protectedBranches.includes(data.branch)) {
      throw new Error(`Cannot push directly to protected branch: ${data.branch}`);
    }
    return data;
  };

  private validatePaths: MiddlewareFunction = async (data, context) => {
    if (data.path) {
      // Ensure path is within allowed directories
      let allowedPaths = ['/Users/shaansisodia/Desktop/Cursor/SISO_ECOSYSTEM'];
      try {
        // Allow override via env or default to cwd for local dev
        const envPaths = typeof process !== 'undefined' && (process as any)?.env?.SISO_ALLOWED_PATHS;
        if (envPaths) {
          allowedPaths = String(envPaths).split(':').filter(Boolean);
        } else if (typeof process !== 'undefined' && typeof (process as any).cwd === 'function') {
          allowedPaths = [ (process as any).cwd() ];
        }
      } catch {}
      const isAllowed = allowedPaths.some(allowed => data.path.startsWith(allowed));
      
      if (!isAllowed) {
        throw new Error(`Path not allowed: ${data.path}`);
      }
    }
    return data;
  };

  private checkBlockedCommands: MiddlewareFunction = async (data, context) => {
    if (data.command) {
      const blockedCommands = [
        'rm -rf', 'rm -r', 'rm --no-preserve-root',
        'sudo', 'chmod 777', 'chown',
        'mkfs', 'diskutil', 'shutdown', 'reboot',
        'kill -9 -1',
        'curl | sh', 'wget | sh'
      ];
      for (const blocked of blockedCommands) {
        if (data.command.includes(blocked)) {
          throw new Error(`Blocked command detected: ${blocked}`);
        }
      }
    }
    return data;
  };

  private enforceExecPolicy: MiddlewareFunction = async (data, context) => {
    const execMethods = new Set(['runCommand', 'runNodeCode', 'runPythonCode', 'runScriptFile']);
    if (context.mcp === 'desktop-commander' && execMethods.has(context.method)) {
      const envAllows = (typeof process !== 'undefined' && (process as any)?.env?.SISO_ALLOW_CODE_EXEC === '1');
      const confirmed = !!data?.confirm;
      if (!envAllows && !confirmed) {
        throw new Error('Code execution disabled. Set SISO_ALLOW_CODE_EXEC=1 or pass confirm: true.');
      }
    }
    return data;
  };

  /**
   * Helper methods
   */
  private extractSections(content: string): string[] {
    const sections = content.match(/^#{1,3}\s+.+$/gm) || [];
    return sections.map(s => s.replace(/^#+\s+/, ''));
  }

  private extractCodeBlocks(content: string): Array<{ language: string; code: string }> {
    const blocks: Array<{ language: string; code: string }> = [];
    const regex = /```(\w+)?\n([\s\S]+?)```/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim()
      });
    }

    return blocks;
  }

  private extractNotionTitle(item: any): string {
    if (item.properties?.title?.title?.[0]?.text?.content) {
      return item.properties.title.title[0].text.content;
    }
    if (item.properties?.Name?.title?.[0]?.text?.content) {
      return item.properties.Name.title[0].text.content;
    }
    return 'Untitled';
  }
}

// Export singleton instance
export const mcpMiddleware = new MCPMiddleware();
