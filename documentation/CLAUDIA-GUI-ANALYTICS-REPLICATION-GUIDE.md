# Claudia-GUI Analytics System - Complete Replication Guide for SISO IDE

## Overview
This document contains a complete analysis of Claudia-GUI's analytics implementation and provides a step-by-step guide to replicate their exact real usage tracking system in SISO IDE.

## Source Analysis - Claudia-GUI Implementation

### Core Architecture
- **Framework**: React + TypeScript + Tauri
- **Analytics Backend**: PostHog (self-hosted or cloud)
- **Storage**: Local-first with optional cloud sync
- **Privacy**: Opt-in consent with automatic PII sanitization
- **Pattern**: Singleton service with event queue and background monitoring

### File Structure in Claudia-GUI
```
src/lib/analytics/
├── index.ts              # Main analytics service singleton
├── types.ts              # TypeScript definitions for all events
├── events.ts             # Event builders and sanitizers
├── consent.ts            # Privacy consent management
└── resourceMonitor.ts    # System resource monitoring
```

### Dependencies Required
```json
{
  "posthog-js": "^1.77.0",
  "posthog-js/react": "^1.77.0"
}
```

## Complete Code Analysis

### 1. Analytics Service Core (`index.ts`)
**Key Features:**
- Singleton pattern for consistent tracking
- Event queueing with 5-second flush intervals
- PostHog integration with privacy controls
- Automatic consent management
- Performance tracking with percentiles
- Screen/context tracking

**Critical Implementation Details:**
- Events are queued locally first, then batched to PostHog
- PII sanitization happens before any data leaves the client
- Opt-out by default, requiring explicit user consent
- Performance metrics auto-calculate P50, P95, P99 percentiles
- Memory-efficient (keeps only last 100 measurements per operation)

### 2. Resource Monitor (`resourceMonitor.ts`)
**Real Usage Tracking Features:**
- **Memory Usage**: JavaScript heap size monitoring
- **Network Activity**: Request count tracking via Performance API
- **Connection Monitoring**: WebSocket/SSE connection counts
- **CPU Usage**: Placeholder for native CPU monitoring (via Tauri)
- **Cache Performance**: Hit rate tracking
- **Threshold Alerts**: Automatic high-usage detection

**Monitoring Strategy:**
- Samples every 60 seconds by default (configurable)
- Reports baseline metrics every 10th sample
- Immediate alerts when thresholds exceeded
- Configurable thresholds per metric type

### 3. Event System (`events.ts` & `types.ts`)
**Comprehensive Event Tracking:**

#### Session Events
- `prompt_submitted`: Length, model, attachments, complexity
- `session_stopped`: Duration, message count, tokens, reason
- `checkpoint_created/restored`: Session state management
- `tool_executed`: Tool name, execution time, success/failure

#### AI Interaction Events  
- `ai_interaction`: Tokens, response quality, context switches
- `model_selected`: Model changes and reasons
- `prompt_pattern`: Effectiveness and iteration tracking

#### Development Events
- `file_opened/edited/saved`: File activity tracking
- `agent_executed`: Agent type, success, duration
- `workflow_started/completed/abandoned`: Process tracking

#### System Performance Events
- `resource_usage_high/sampled`: Resource consumption
- `api_error`: Endpoint failures and response times
- `performance_bottleneck`: Operation timing issues
- `memory_warning`: Memory pressure alerts

#### MCP Integration Events
- `mcp_server_connected/disconnected`: Server status
- `mcp_tool_invoked`: Tool usage patterns
- `mcp_connection_error`: Connection failures

### 4. Privacy & Sanitization (`events.ts` sanitizers)
**Automatic PII Removal:**
```typescript
// File paths → *.extension
sanitizeFilePath: (path: string) => {
  const ext = path.split('.').pop();
  return ext ? `*.${ext}` : 'unknown';
}

// API keys/tokens → ***
sanitizeErrorMessage: (message: string) => {
  return message.replace(/[a-zA-Z0-9]{20,}/g, '***');
}

// Email addresses → ***@***.***
// Project names → 'project'
// User-specific IDs → removed
```

## Direct Code Replication Analysis

### 100% Copy-Paste Ready Components

#### Analytics Core Files (src/lib/analytics/)
```bash
# These files can be copied EXACTLY with zero modifications:
claudia-gui/src/lib/analytics/types.ts → siso-ide/src/lib/analytics/types.ts
claudia-gui/src/lib/analytics/consent.ts → siso-ide/src/lib/analytics/consent.ts
claudia-gui/src/lib/analytics/index.ts → siso-ide/src/lib/analytics/index.ts
claudia-gui/src/lib/analytics/events.ts → siso-ide/src/lib/analytics/events.ts
```

#### Dependencies (package.json)
```json
{
  "posthog-js": "^1.258.3" // Exact version from Claudia-GUI
}
```

#### Environment Variables (.env)
```bash
VITE_PUBLIC_POSTHOG_KEY=your_posthog_key
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 95% Copy-Paste Ready Components

#### Resource Monitor (src/lib/analytics/resourceMonitor.ts)
- Copy file exactly
- Add 3 SISO-specific metrics functions:
  ```typescript
  private getIDESpecificMetrics(): IDEResourceProperties {
    return {
      active_claude_sessions: this.getActiveClaudeSessions(),
      mcp_servers_connected: this.getMCPServerCount(),
      code_generation_rate: this.getCodeGenerationRate()
    };
  }
  ```

#### Usage Dashboard (src/components/UsageDashboard.tsx)
- Copy file exactly
- Replace API calls with SISO equivalents:
  ```typescript
  // Change this:
  api.getUsageStats()
  // To this:
  sisoApi.getUsageStats()
  ```

### Integration Points Analysis

#### 1. API Layer Integration
Claudia-GUI uses Tauri API calls - SISO IDE needs equivalent:

**Claudia-GUI API Structure:**
```typescript
// In src/lib/api.ts - Lines 1092-1152
async getUsageStats(): Promise<UsageStats> {
  return await invoke<UsageStats>("get_usage_stats");
}

async getUsageByDateRange(startDate: string, endDate: string): Promise<UsageStats> {
  return await invoke<UsageStats>("get_usage_by_date_range", { startDate, endDate });
}

async getSessionStats(since?: string, until?: string, order?: "asc" | "desc"): Promise<ProjectUsage[]> {
  return await invoke<ProjectUsage[]>("get_session_stats", { since, until, order });
}
```

**SISO IDE Equivalent Needed:**
```typescript
// In siso-ide/src/lib/api.ts
async getUsageStats(): Promise<UsageStats> {
  // Connect to SISO IDE's data source (SQLite/API)
  return await sisoInvoke<UsageStats>("get_usage_stats");
}
```

#### 2. Real Usage Data Source
**Claudia-GUI Data Flow:**
- Rust backend → SQLite database → Tauri invoke → Frontend
- Data structure: `UsageStats`, `ModelUsage`, `ProjectUsage`, `DailyUsage`

**SISO IDE Integration:**
- Same data structures (copy exactly from types.ts)
- Different data source: SISO IDE's session tracking
- Same API interface pattern

#### 3. Event Tracking Integration
**Claudia-GUI Event Hooks:**
```typescript
// They track events through their Tauri app lifecycle
analytics.track('session_started', { model: 'claude-4-opus' });
analytics.track('prompt_submitted', { prompt_length: 150, model: 'claude-sonnet' });
analytics.track('tool_executed', { tool_name: 'file_read', success: true });
```

**SISO IDE Event Integration Points:**
```typescript
// Hook into SISO IDE events
ideEventBus.on('claude_session_started', (data) => {
  analytics.track('session_started', { model: data.model });
});

ideEventBus.on('claude_prompt_submitted', (data) => {
  analytics.track('prompt_submitted', {
    prompt_length: data.prompt.length,
    model: data.model,
    has_attachments: data.attachments?.length > 0
  });
});
```

### Exact File Copy Instructions

#### Step 1: Copy Analytics Core (100% Reusable)
```bash
# Create analytics directory
mkdir -p siso-ide/src/lib/analytics

# Copy files exactly - NO CHANGES NEEDED
cp claudia-gui/src/lib/analytics/types.ts siso-ide/src/lib/analytics/
cp claudia-gui/src/lib/analytics/consent.ts siso-ide/src/lib/analytics/
cp claudia-gui/src/lib/analytics/index.ts siso-ide/src/lib/analytics/
cp claudia-gui/src/lib/analytics/events.ts siso-ide/src/lib/analytics/
cp claudia-gui/src/lib/analytics/resourceMonitor.ts siso-ide/src/lib/analytics/
```

#### Step 2: Copy UI Components (95% Reusable)
```bash
# Copy usage dashboard
cp claudia-gui/src/components/UsageDashboard.tsx siso-ide/src/components/
cp claudia-gui/src/components/AnalyticsConsent.tsx siso-ide/src/components/
cp claudia-gui/src/components/AnalyticsErrorBoundary.tsx siso-ide/src/components/
```

#### Step 3: Dependencies Installation
```bash
cd siso-ide
npm install posthog-js
```

#### Step 4: Initialization (Copy from main.tsx)
```typescript
// In siso-ide main.tsx or app initialization
import { analytics, resourceMonitor } from './lib/analytics';

// Initialize analytics
analytics.initialize();

// Start resource monitoring (every 2 minutes like Claudia)
resourceMonitor.startMonitoring(120000);
```

### SISO IDE Specific Adaptations Needed

#### 1. API Layer Mapping
**File:** `siso-ide/src/lib/api.ts`
**Changes:** Add usage tracking methods to SISO's existing API

#### 2. Event System Integration  
**File:** `siso-ide/src/lib/analytics/sisoIntegration.ts` (new file)
**Purpose:** Bridge SISO IDE events to analytics system

#### 3. Data Storage Adapter
**File:** `siso-ide/src/lib/analytics/dataAdapter.ts` (new file)  
**Purpose:** Connect analytics to SISO's data storage (SQLite/API)

### Verification of Copy-Paste Strategy

#### Claudia-GUI Dependencies Analysis
From `package.json` inspection:
- `posthog-js: ^1.258.3` ✅ Direct dependency
- React 18.3.1 ✅ Compatible with modern React
- TypeScript ~5.6.2 ✅ Modern TypeScript
- Vite 6.0.3 ✅ Modern build tool

#### SISO IDE Compatibility Check
- Uses React ✅
- Uses TypeScript ✅  
- Uses Vite/modern bundler ✅
- Can install PostHog ✅

**Conclusion: 100% compatible for direct file copying**

### Real Implementation Data Flow

#### Claudia-GUI Flow:
```
User Action → Event → Analytics.track() → PostHog → Dashboard
                ↓
            Local Storage ← SQLite ← Rust Backend
```

#### SISO IDE Flow (Target):
```
User Action → Event → Analytics.track() → PostHog → Dashboard
                ↓
            Local Storage ← SISO Data ← SISO Backend
```

**Key Insight:** Only the data source changes, everything else copies exactly.

## Implementation Plan for SISO IDE

### Step 1: Direct File Copy
```bash
# Copy these files exactly from Claudia-GUI:
cp claudia-gui/src/lib/analytics/types.ts siso-ide/src/lib/analytics/
cp claudia-gui/src/lib/analytics/consent.ts siso-ide/src/lib/analytics/
cp claudia-gui/src/lib/analytics/index.ts siso-ide/src/lib/analytics/
cp claudia-gui/src/lib/analytics/events.ts siso-ide/src/lib/analytics/
```

### Step 2: Install Dependencies
```bash
npm install posthog-js
npm install -D @types/node  # If not already installed
```

### Step 3: Environment Setup
```typescript
// .env
VITE_PUBLIC_POSTHOG_KEY=your_posthog_key
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Step 4: Initialize in SISO IDE
```typescript
// main.tsx or app initialization
import { analytics, resourceMonitor } from './lib/analytics';

// Initialize analytics
analytics.initialize();

// Start monitoring (every 2 minutes like Claudia)
resourceMonitor.startMonitoring(120000);
```

### Step 5: Hook Integration Points
```typescript
// Integration with SISO IDE events
// File operations
ideEventBus.on('file:saved', (file) => {
  analytics.track('file_saved', {
    language: file.extension,
    ai_generated: file.metadata?.aiGenerated,
    size_bytes: file.size
  });
});

// Claude Code integration
claudeCodeWrapper.onPromptSubmitted = (prompt, model) => {
  analytics.track('prompt_submitted', {
    prompt_length: prompt.length,
    model: model,
    has_attachments: prompt.attachments?.length > 0
  });
};

// Tool usage
mcpToolWrapper.onToolExecuted = (tool, result) => {
  analytics.track('tool_executed', {
    tool_name: tool.name,
    execution_time_ms: result.duration,
    success: result.success
  });
};
```

## SISO IDE Specific Enhancements

### Additional Event Types Needed
```typescript
// Add to types.ts
export type SISOEventName = 
  | 'code_generated'
  | 'feature_completed'
  | 'debug_session_started'
  | 'test_run_completed'
  | 'productivity_milestone'
  | 'workflow_optimized'
  | 'claude_model_switched'
  | 'mcp_server_discovered'
  | 'automation_script_executed';

// Add to events.ts
export interface CodeGenerationProperties {
  lines_generated: number;
  language: string;
  generation_time_ms: number;
  tokens_used: number;
  acceptance_rate: number;
  iterations_required: number;
}

export interface FeatureCompletionProperties {
  feature_type: string;
  total_time_ms: number;
  ai_assistance_percentage: number;
  files_modified: number;
  tests_written: number;
  complexity_score: number;
}
```

### Resource Monitor Extensions
```typescript
// Extend resourceMonitor.ts for IDE-specific metrics
private getIDESpecificMetrics(): IDEResourceProperties {
  return {
    // Development metrics
    active_claude_sessions: getActiveClaudeSessions(),
    mcp_servers_connected: getMCPServerCount(),
    open_files_count: getOpenFilesCount(),
    
    // Performance metrics  
    code_generation_rate: getCodeGenerationRate(),
    token_usage_rate: getTokenUsageRate(),
    productivity_score: calculateProductivityScore(),
    
    // Resource usage
    vscode_memory_usage: getVSCodeMemoryUsage(),
    node_processes_memory: getNodeProcessesMemory(),
    disk_space_used: getDiskSpaceUsed()
  };
}
```

## UI Integration Strategy

### Status Bar Integration
```typescript
// Real-time usage indicators
<StatusBar>
  <TokenUsageIndicator />
  <CostTracker />
  <ProductivityScore />
  <ResourceHealth />
</StatusBar>
```

### Dashboard Panel
```typescript
// Comprehensive usage dashboard
<AnalyticsDashboard>
  <RealTimeMetrics />
  <SessionHistory />
  <CostAnalysis />
  <ProductivityTrends />
  <ToolEffectiveness />
  <ResourceUsage />
</AnalyticsDashboard>
```

### Settings Integration
```typescript
// Analytics preferences
<AnalyticsSettings>
  <ConsentManagement />
  <DataRetention />
  <ExportOptions />
  <PrivacyControls />
</AnalyticsSettings>
```

## Data Schema for SISO IDE

### Core Analytics Tables
```sql
-- Sessions
sessions: {
  id, user_id, start_time, end_time, duration_ms,
  prompts_sent, tokens_used, files_modified,
  productivity_score, model_used, mcp_tools_used
}

-- Events  
events: {
  id, session_id, event_type, timestamp, properties,
  sanitized_properties, user_action, context
}

-- Resource Usage
resource_samples: {
  id, timestamp, memory_mb, cpu_percent, network_requests,
  active_connections, disk_io_mb, cache_hit_rate
}

-- Development Metrics
development_metrics: {
  id, session_id, lines_generated, features_completed,
  debug_cycles, test_pass_rate, code_acceptance_rate,
  time_to_completion, ai_assistance_level
}
```

## Privacy Compliance

### GDPR/Privacy Requirements
- ✅ Opt-in consent required
- ✅ Data minimization (only necessary metrics)
- ✅ Right to deletion (full data purge)
- ✅ Data portability (export functionality)
- ✅ Local-first storage option
- ✅ Automatic PII sanitization
- ✅ Transparent data usage

### Security Measures
- ✅ No API keys or secrets logged
- ✅ File paths sanitized to extensions only
- ✅ Project names genericized
- ✅ User identifiers anonymized
- ✅ Error messages scrubbed of sensitive data

## Testing Strategy

### Unit Tests
```typescript
describe('Analytics Service', () => {
  test('sanitizes PII from file paths')
  test('queues events when offline')
  test('respects consent settings')
  test('calculates performance percentiles')
  test('handles PostHog connection failures')
});
```

### Integration Tests
```typescript
describe('SISO IDE Integration', () => {
  test('tracks file operations correctly')
  test('measures code generation metrics')
  test('monitors resource usage')
  test('handles MCP tool events')
});
```

## Deployment Considerations

### Environment Configuration
```typescript
// Production
VITE_PUBLIC_POSTHOG_KEY=prod_key
VITE_PUBLIC_POSTHOG_HOST=https://analytics.siso-ide.com

// Development  
VITE_PUBLIC_POSTHOG_KEY=dev_key
VITE_PUBLIC_POSTHOG_HOST=http://localhost:8000

// Offline/Local
VITE_ANALYTICS_OFFLINE=true
VITE_ANALYTICS_LOCAL_ONLY=true
```

### Performance Optimization
- Event batching (5 second intervals)
- Memory limits (100 samples per metric)
- Async processing (non-blocking UI)
- Graceful degradation (works offline)
- Minimal overhead (< 5% performance impact)

## Migration Path

### Phase 1: Foundation (Week 1)
1. Copy core analytics files from Claudia-GUI
2. Install dependencies and basic setup
3. Implement consent management
4. Basic event tracking (file operations)

### Phase 2: Integration (Week 2)
1. Hook into SISO IDE event system
2. Implement resource monitoring
3. Add Claude Code API wrapper
4. Basic UI components (status bar)

### Phase 3: Enhancement (Week 3)
1. Add SISO-specific metrics
2. Build analytics dashboard
3. Implement data export
4. Performance optimization

### Phase 4: Production (Week 4)
1. Security audit and testing
2. Privacy compliance verification
3. Production deployment
4. User documentation

## Success Metrics

### Technical Metrics
- < 5% performance overhead
- > 99% event delivery reliability
- < 100ms analytics response time
- Zero PII leakage incidents

### Business Metrics
- User engagement with analytics features
- Productivity improvement visibility
- Cost optimization insights
- Feature adoption tracking

## Conclusion

Claudia-GUI's analytics system is highly replicable for SISO IDE. The core architecture (PostHog + TypeScript + React) is identical, and most code can be copied directly. The main adaptations needed are:

1. **Event types**: Add development-specific events
2. **Resource monitoring**: Include IDE-specific metrics  
3. **UI integration**: Build SISO-appropriate dashboard
4. **Workflow tracking**: Capture development productivity

The implementation provides enterprise-grade analytics with privacy compliance, real-time monitoring, and comprehensive development insights - exactly what SISO IDE needs to show real usage data like Claudia-GUI.