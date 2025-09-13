/**
 * SISO MCP (Model Context Protocol) Services
 * 
 * This module provides a comprehensive MCP management system including:
 * - Orchestration of multi-step workflows
 * - Unified client with smart routing
 * - Response caching for performance
 * - Monitoring and metrics collection
 * - Middleware for validation and transformation
 */

export { MCPOrchestrator } from './mcp-orchestrator';
export type { 
  MCPStep, 
  MCPWorkflow, 
  MCPExecutionResult, 
  WorkflowExecutionResult 
} from './mcp-orchestrator';

export { UnifiedMCPClient } from './unified-mcp-client';
export type { 
  MCPIntent, 
  MCPClientConfig, 
  MCPRouteRule 
} from './unified-mcp-client';

export { MCPCache, mcpCache } from './mcp-cache';
export type { 
  CacheEntry, 
  CacheConfig, 
  CacheStats 
} from './mcp-cache';

export { MCPWorkflows, WorkflowTemplates, WorkflowBuilder } from './mcp-workflows';

export { MCPMonitor, mcpMonitor } from './mcp-monitor';
export type { 
  MCPMetric, 
  MCPStats, 
  MCPHealthStatus, 
  MonitorConfig 
} from './mcp-monitor';

export { MCPMiddleware, mcpMiddleware } from './mcp-middleware';
export type { 
  MiddlewareFunction, 
  MiddlewareContext, 
  ValidationSchema 
} from './mcp-middleware';

import { MCPOrchestrator } from './mcp-orchestrator';
import { UnifiedMCPClient } from './unified-mcp-client';
import { MCPCache, mcpCache } from './mcp-cache';
import { MCPMonitor, mcpMonitor } from './mcp-monitor';
import { MCPMiddleware, mcpMiddleware } from './mcp-middleware';
import DesktopCommanderClient from './desktop-commander-client';
import SupabaseMCPClient from './supabase-client';

/**
 * Quick start function to initialize all MCP services
 */
export function initializeMCPServices(config?: {
  cache?: Partial<import('./mcp-cache').CacheConfig>;
  monitor?: Partial<import('./mcp-monitor').MonitorConfig>;
  client?: import('./unified-mcp-client').MCPClientConfig;
}): {
  orchestrator: MCPOrchestrator;
  client: UnifiedMCPClient;
  cache: MCPCache;
  monitor: MCPMonitor;
  middleware: MCPMiddleware;
} {
  const orchestrator = new MCPOrchestrator();
  const client = new UnifiedMCPClient(config?.client);
  
  // Register common MCPs (these would be actual MCP clients in production)
  // Example registration - replace with actual MCP clients
  const mcps = ['supabase', 'context7', 'notion', 'github', 'exa', 'slack', 'desktop-commander'];
  mcps.forEach(mcp => {
    if (mcp === 'desktop-commander') {
      const allowExec = (typeof process !== 'undefined' && process.env && (process.env.SISO_ALLOW_CODE_EXEC === '1' || process.env.SISO_ALLOW_CODE_EXEC === 'true')) || false;
      const allowedPaths = (typeof process !== 'undefined' && process.env?.SISO_ALLOWED_PATHS ? process.env.SISO_ALLOWED_PATHS.split(':') : [process.cwd()]);
      const allowedCommands = (typeof process !== 'undefined' && process.env?.SISO_ALLOWED_COMMANDS ? process.env.SISO_ALLOWED_COMMANDS.split(',').map(s => s.trim()).filter(Boolean) : undefined);
      const dc = new DesktopCommanderClient({
        // Keep defaults conservative; paths limited to project root
        allowedPaths,
        allowExec,
        allowedCommands: allowedCommands && allowedCommands.length ? allowedCommands : undefined,
      });
      orchestrator.registerMCPClient(mcp, dc);
    } else if (mcp === 'supabase') {
      try {
        const supa = new SupabaseMCPClient();
        orchestrator.registerMCPClient(mcp, supa);
      } catch (e) {
        // If env not present, register a stub that throws informative error
        orchestrator.registerMCPClient(mcp, {
          executeSql() { throw new Error('Supabase MCP not configured: set SUPABASE_URL and SUPABASE_ANON_KEY'); }
        });
      }
    } else {
      orchestrator.registerMCPClient(mcp, {
        // Placeholder for actual MCP client
      });
    }
  });

  return {
    orchestrator,
    client,
    cache: mcpCache,
    monitor: mcpMonitor,
    middleware: mcpMiddleware
  };
}
