import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { 
  MCPOrchestrator, 
  UnifiedMCPClient, 
  MCPCache, 
  MCPMonitor,
  MCPMiddleware,
  MCPWorkflows
} from '../index';

// Mock MCP clients
const mockMCPClients = {
  supabase: {
    executeSql: vi.fn().mockResolvedValue([{ id: 1, name: 'test' }]),
    getAdvisors: vi.fn().mockResolvedValue({ issues: [] })
  },
  context7: {
    resolveLibraryId: vi.fn().mockResolvedValue({ libraryId: '/react/docs' }),
    getLibraryDocs: vi.fn().mockResolvedValue({ content: 'React documentation' })
  },
  notion: {
    createPage: vi.fn().mockResolvedValue({ id: 'page-123' }),
    search: vi.fn().mockResolvedValue({ results: [] })
  },
  github: {
    createBranch: vi.fn().mockResolvedValue({ ref: 'refs/heads/feature' }),
    getPullRequest: vi.fn().mockResolvedValue({ number: 123 })
  },
  exa: {
    webSearch: vi.fn().mockResolvedValue([{ title: 'Result', url: 'http://example.com' }])
  }
};

describe('MCP Integration Tests', () => {
  let orchestrator: MCPOrchestrator;
  let client: UnifiedMCPClient;
  let cache: MCPCache;
  let monitor: MCPMonitor;
  let middleware: MCPMiddleware;

  beforeAll(() => {
    orchestrator = new MCPOrchestrator();
    client = new UnifiedMCPClient();
    cache = new MCPCache({ defaultTTL: 1000 }); // Short TTL for tests
    monitor = new MCPMonitor();
    middleware = new MCPMiddleware();

    // Register mock MCP clients
    Object.entries(mockMCPClients).forEach(([name, mockClient]) => {
      orchestrator.registerMCPClient(name, mockClient);
      client.registerMCP(name, mockClient);
    });
  });

  afterAll(() => {
    cache.destroy();
    monitor.destroy();
  });

  describe('Smart Routing', () => {
    it('should route documentation queries to context7', async () => {
      const result = await client.smartQuery('documentation for React hooks');
      
      expect(mockMCPClients.context7.resolveLibraryId).toHaveBeenCalled();
      expect(mockMCPClients.context7.getLibraryDocs).toHaveBeenCalled();
    });

    it('should route database queries to supabase', async () => {
      const result = await client.smartQuery('SELECT * FROM users WHERE active = true');
      
      expect(mockMCPClients.supabase.executeSql).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('SELECT')
        })
      );
    });

    it('should route search queries to exa', async () => {
      const result = await client.smartQuery('search for TypeScript best practices');
      
      expect(mockMCPClients.exa.webSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('TypeScript')
        })
      );
    });
  });

  describe('Workflow Orchestration', () => {
    it('should execute steps in parallel when no dependencies', async () => {
      const workflow = {
        id: 'test-parallel',
        name: 'Test Parallel',
        parallel: true,
        steps: [
          { id: 'step1', mcp: 'github', action: 'createBranch', params: { branchName: 'test-branch' } },
          { id: 'step2', mcp: 'supabase', action: 'executeSql', params: { query: 'SELECT * FROM test' } },
          { id: 'step3', mcp: 'notion', action: 'createPage', params: { parentId: '12345678-1234-1234-1234-123456789abc', parentType: 'page', title: 'Test Page' } }
        ]
      };

      const result = await orchestrator.executeWorkflow(workflow);
      
      // Debug: Log results to see which step is failing
      console.log('Workflow results:', result.results.map(r => ({ stepId: r.stepId, status: r.status, error: r.error?.message })));
      
      expect(result.status).toBe('completed');
      expect(result.results).toHaveLength(3);
      expect(result.results.every(r => r.status === 'success')).toBe(true);
    });

    it('should respect dependencies in workflows', async () => {
      const callOrder: string[] = [];
      
      // Track call order
      mockMCPClients.github.getPullRequest = vi.fn().mockImplementation(() => {
        callOrder.push('getPullRequest');
        return Promise.resolve({ number: 123 });
      });
      
      mockMCPClients.supabase.getAdvisors = vi.fn().mockImplementation(() => {
        callOrder.push('getAdvisors');
        return Promise.resolve({ issues: [] });
      });

      const workflow = {
        id: 'test-deps',
        name: 'Test Dependencies',
        steps: [
          { id: 'get-pr', mcp: 'github', action: 'getPullRequest' },
          { 
            id: 'check-security', 
            mcp: 'supabase', 
            action: 'getAdvisors',
            dependsOn: ['get-pr']
          }
        ]
      };

      await orchestrator.executeWorkflow(workflow);
      
      expect(callOrder).toEqual(['getPullRequest', 'getAdvisors']);
    });

    it('should handle workflow errors gracefully', async () => {
      mockMCPClients.github.createBranch = vi.fn().mockRejectedValue(new Error('Branch exists'));

      const workflow = {
        id: 'test-error',
        name: 'Test Error',
        onError: 'continue' as const,
        steps: [
          { id: 'step1', mcp: 'github', action: 'createBranch', params: { branchName: 'test-branch' } },
          { id: 'step2', mcp: 'notion', action: 'createPage', params: { parentId: '12345678-1234-1234-1234-123456789abc', parentType: 'page', title: 'Test Page' } }
        ]
      };

      const result = await orchestrator.executeWorkflow(workflow);
      
      expect(result.status).toBe('partial');
      expect(result.results[0].status).toBe('error');
      expect(result.results[1].status).toBe('success');
    });
  });

  describe('Response Caching', () => {
    it('should cache MCP responses', async () => {
      const key = cache.generateKey('context7', 'getLibraryDocs', { library: 'react' });
      
      // First call - should miss cache
      const result1 = await cache.cachedCall(
        'context7',
        'getLibraryDocs',
        { library: 'react' },
        () => Promise.resolve({ content: 'React docs' })
      );

      // Second call - should hit cache
      const result2 = cache.get(key);
      
      expect(result2).toEqual({ content: 'React docs' });
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
    });

    it('should respect TTL', async () => {
      const shortCache = new MCPCache({ defaultTTL: 100 }); // 100ms TTL
      
      await shortCache.cachedCall(
        'test',
        'method',
        { param: 1 },
        () => Promise.resolve('data'),
        { ttl: 100 }
      );

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const key = shortCache.generateKey('test', 'method', { param: 1 });
      const result = shortCache.get(key);
      
      expect(result).toBeNull();
      shortCache.destroy();
    });
  });

  describe('Monitoring', () => {
    it('should record metrics correctly', () => {
      monitor.recordMetric({
        mcp: 'supabase',
        method: 'executeSql',
        timestamp: new Date(),
        duration: 150,
        status: 'success'
      });

      monitor.recordMetric({
        mcp: 'supabase',
        method: 'executeSql',
        timestamp: new Date(),
        duration: 250,
        status: 'success'
      });

      monitor.recordMetric({
        mcp: 'supabase',
        method: 'executeSql',
        timestamp: new Date(),
        duration: 100,
        status: 'error',
        errorMessage: 'Connection timeout'
      });

      const stats = monitor.getStats('supabase');
      
      expect(stats.totalCalls).toBe(3);
      expect(stats.successCount).toBe(2);
      expect(stats.errorCount).toBe(1);
      expect(stats.errorRate).toBeCloseTo(33.33, 1);
      expect(stats.avgResponseTime).toBe(200); // (150 + 250) / 2
    });

    it('should generate performance reports', () => {
      const report = monitor.getPerformanceReport();
      
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('byMCP');
      expect(report).toHaveProperty('topErrors');
      expect(report).toHaveProperty('slowestOperations');
    });
  });

  describe('Middleware', () => {
    it('should validate input parameters', async () => {
      const invalidData = {
        query: '', // Empty query should fail
        projectId: '123'
      };

      await expect(
        middleware.preProcess('supabase', 'executeSql', invalidData)
      ).rejects.toThrow();
    });

    it('should sanitize SQL queries', async () => {
      const dangerousQuery = {
        query: 'SELECT * FROM users; DROP TABLE users;'
      };

      await expect(
        middleware.preProcess('supabase', 'executeSql', dangerousQuery)
      ).rejects.toThrow(/dangerous SQL/);
    });

    it('should transform responses', async () => {
      const rawData = [
        { id: 1, password: 'secret123', name: 'John' },
        { id: 2, api_key: 'key456', name: 'Jane' }
      ];

      const processed = await middleware.postProcess('supabase', 'executeSql', rawData);
      
      expect(processed[0].password).toBe('***MASKED***');
      expect(processed[1].api_key).toBe('***MASKED***');
      expect(processed[0].name).toBe('John'); // Non-sensitive data preserved
    });
  });

  describe('Pre-built Workflows', () => {
    it('should have valid workflow definitions', () => {
      const deployWorkflow = MCPWorkflows.deployFeature;
      
      expect(deployWorkflow).toBeDefined();
      expect(deployWorkflow.steps).toHaveLength(4);
      expect(deployWorkflow.parallel).toBe(true);
      
      // Check all required MCPs are referenced
      const mcps = deployWorkflow.steps.map(s => s.mcp);
      expect(mcps).toContain('github');
      expect(mcps).toContain('supabase');
      expect(mcps).toContain('context7');
      expect(mcps).toContain('notion');
    });
  });

  describe('Error Handling', () => {
    it('should handle MCP client not found', async () => {
      const workflow = {
        id: 'test-missing',
        name: 'Test Missing MCP',
        steps: [
          { id: 'step1', mcp: 'nonexistent', action: 'someAction' }
        ]
      };

      const result = await orchestrator.executeWorkflow(workflow);
      
      expect(result.status).toBe('failed');
      expect(result.results[0].error?.message).toContain('not registered');
    });

    it('should retry failed operations', async () => {
      let attempts = 0;
      mockMCPClients.github.createBranch = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 2) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ ref: 'refs/heads/feature' });
      });

      const workflow = {
        id: 'test-retry',
        name: 'Test Retry',
        steps: [
          { 
            id: 'step1', 
            mcp: 'github', 
            action: 'createBranch',
            params: { branchName: 'test-branch' },
            retryConfig: { maxRetries: 2, backoffMs: 10 }
          }
        ]
      };

      const result = await orchestrator.executeWorkflow(workflow);
      
      expect(result.status).toBe('completed');
      expect(attempts).toBe(2);
    });
  });
});