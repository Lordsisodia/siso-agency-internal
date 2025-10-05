# SISO MCP Services

Advanced Model Context Protocol (MCP) management system for the SISO ecosystem.

## Overview

This MCP service layer provides:
- 🔄 **Orchestration** - Multi-step workflow execution
- 🧠 **Smart Routing** - Intent-based MCP selection
- ⚡ **Caching** - High-performance response caching
- 📊 **Monitoring** - Real-time metrics and health checks
- 🛡️ **Middleware** - Validation and transformation
- 🔧 **Workflows** - Pre-built automation patterns

## Quick Start

```typescript
import { initializeMCPServices } from './services/mcp';

// Initialize all MCP services
const mcp = initializeMCPServices({
  cache: { defaultTTL: 900000 }, // 15 minutes
  monitor: { alertThresholds: { errorRate: 5 } }
});

// Smart query with auto-routing
const result = await mcp.client.smartQuery(
  "documentation for Next.js routing"
);

// Execute a workflow
const deployment = await mcp.client.executeWorkflow('deployFeature', {
  featureName: 'user-dashboard',
  requiredLibraries: ['react', 'tailwind']
});
```

## Services

### 1. MCP Orchestrator

Manages complex multi-step workflows with dependency resolution.

```typescript
const workflow = {
  id: 'my-workflow',
  name: 'Custom Workflow',
  parallel: true,
  steps: [
    { id: 'step1', mcp: 'github', action: 'createBranch' },
    { id: 'step2', mcp: 'supabase', action: 'createBranch' },
    { id: 'step3', mcp: 'notion', action: 'createTasks', dependsOn: ['step1'] }
  ]
};

const result = await orchestrator.executeWorkflow(workflow);
```

### 2. Unified MCP Client

Smart routing based on query intent detection.

```typescript
// Automatically routes to Context7 for documentation
await client.smartQuery("docs for React hooks");

// Routes to Supabase with read-only mode
await client.smartQuery("SELECT * FROM users");

// Routes to Exa for web search
await client.smartQuery("search for TypeScript best practices");
```

### 3. Response Caching

High-performance caching with LRU eviction.

```typescript
// Cached MCP call
const data = await cache.cachedCall(
  'context7',
  'getLibraryDocs',
  { libraryName: 'react' },
  async () => mcpClient.getLibraryDocs({ libraryName: 'react' }),
  { ttl: 3600000 } // 1 hour
);

// Cache statistics
const stats = cache.getStats();
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(2)}%`);
```

### 4. Monitoring & Metrics

Real-time monitoring with alerting.

```typescript
// Record metrics
monitor.recordMetric({
  mcp: 'supabase',
  method: 'executeSql',
  timestamp: new Date(),
  duration: 145,
  status: 'success'
});

// Get performance report
const report = monitor.getPerformanceReport();
console.log(report.summary);

// Subscribe to alerts
monitor.on('alert', ({ mcp, alerts }) => {
  console.error(`MCP ${mcp} alerts:`, alerts);
});
```

### 5. Middleware

Validation and transformation pipeline.

```typescript
// Add custom middleware
middleware.addPreProcessor('myMcp', async (data, context) => {
  // Validate and transform input
  return { ...data, validated: true };
});

// Set validation schema
middleware.setValidationSchema('myMcp.myMethod', {
  pre: z.object({
    name: z.string().min(1),
    age: z.number().positive()
  })
});
```

## Pre-built Workflows

### Deploy Feature
```typescript
await client.executeWorkflow('deployFeature', {
  featureName: 'payment-integration',
  requiredLibraries: ['stripe', 'react'],
  projectPageId: 'notion-page-id'
});
```

### Code Review
```typescript
await client.executeWorkflow('codeReview', {
  prNumber: 123,
  projectId: 'supabase-project-id'
});
```

### Technology Research
```typescript
await client.executeWorkflow('technologyResearch', {
  technology: 'WebAssembly',
  specificTopic: 'performance optimization'
});
```

## Configuration

### Rules Configuration (`.siso/mcp-rules.yml`)
```yaml
rules:
  - match: "documentation for (.+)"
    mcp: context7
    autoInvoke: true
    cache:
      enabled: true
      ttl: 900000
```

### MCP Configuration (`.siso/mcp-config.json`)
```json
{
  "security": {
    "supabase": {
      "readOnly": true,
      "projectScoped": true
    }
  },
  "performance": {
    "cacheConfig": {
      "maxSize": 104857600,
      "defaultTTL": 900000
    }
  }
}
```

## Multi-Agent Support

Optimized for Claudia Fresh 6-agent grid:

```typescript
// Agent specialization
const agentAssignments = {
  agent1: ['supabase', 'database'],
  agent2: ['context7', 'documentation'],
  agent3: ['github', 'code'],
  agent4: ['puppeteer', 'testing'],
  agent5: ['notion', 'content'],
  agent6: ['desktop-commander', 'system']
};
```

## Security Features

- **Read-only modes** for database operations
- **Path validation** for file system access
- **Command blocking** for dangerous operations
- **Branch protection** for GitHub operations
- **SQL injection prevention**
- **Token limits** for API calls

## Performance Optimizations

- **Smart caching** with TTL and LRU eviction
- **Parallel execution** for independent steps
- **Batch operations** for multiple requests
- **Response compression** for large payloads
- **Rate limiting** per MCP service
- **Predictive prefetching** (experimental)

## Monitoring Dashboard

Access real-time metrics:
- Call volumes by MCP
- Error rates and types
- Response time percentiles
- Token usage and costs
- Health status indicators

## Best Practices

1. **Use workflows** for complex multi-step operations
2. **Enable caching** for frequently accessed data
3. **Set appropriate timeouts** based on operation type
4. **Monitor error rates** and adjust retry policies
5. **Use middleware** for consistent validation
6. **Implement cost tracking** for paid APIs

## Troubleshooting

### High Error Rates
- Check MCP health status
- Review recent error messages
- Verify API credentials
- Check rate limits

### Slow Performance
- Enable caching for repeated queries
- Use parallel execution in workflows
- Review p95/p99 response times
- Consider increasing timeouts

### Cache Misses
- Check cache TTL settings
- Verify cache key generation
- Monitor cache eviction rates
- Increase cache size if needed

## Future Enhancements

- [ ] GraphQL support for complex queries
- [ ] WebSocket support for real-time MCPs
- [ ] Machine learning for intent detection
- [ ] Automatic workflow optimization
- [ ] Cross-MCP transaction support
- [ ] Visual workflow builder

## Contributing

To add a new MCP integration:

1. Create MCP client wrapper
2. Add middleware rules
3. Define validation schemas
4. Create workflow templates
5. Update documentation

---

For more information, see the [SISO Ecosystem Documentation](../../README.md)