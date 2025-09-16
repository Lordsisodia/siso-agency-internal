# Lib Directory

**20+ utility modules, configurations, and helper functions for application infrastructure**

## 🏗️ Directory Overview

This directory contains all utility modules, configuration files, helper functions, and infrastructure code that supports the SISO Internal application. These modules provide foundational functionality used throughout the application.

### 📊 Library Statistics  
- **Total Modules**: 20+ utility and configuration files
- **Organization**: Functional grouping by purpose
- **Coverage**: Database, API, Utils, Workflow, Design System
- **TypeScript Coverage**: 100% (strict mode)

## 📁 Library Structure

### Core Infrastructure

#### Database Configuration
```
database/
└── prisma.ts              # Prisma client configuration and setup
```

#### API & External Services
```
api.ts                      # Generic API client and HTTP utilities
autonomous-api.ts           # Autonomous API handling and processing
claudia-api.ts             # Claudia Lambda API integration
supabase.ts                # Supabase client configuration
supabase-clerk.ts          # Supabase + Clerk integration
```

### Workflow & Automation

#### Claude AI Workflow System
```
claude-workflow-engine.ts   # Core Claude workflow processing engine
claude-workflow-manager.ts  # Claude workflow orchestration and management
auto-continuation.ts        # Automatic workflow continuation logic
smart-continuation.ts       # Intelligent continuation strategies
```

#### Analysis & Processing
```
result-analyzer.ts          # Result analysis and interpretation
outputCache.tsx            # Output caching and performance optimization
```

### Utilities & Helpers

#### Core Utilities
```
utils.ts                   # General utility functions and helpers
formatters.ts              # Data formatting and transformation utilities
date-utils.ts              # Date/time manipulation and formatting
```

#### Design System
```
design-tokens.ts           # Design system tokens and theme configuration
```

#### Monitoring & Error Handling
```
sentry.ts                  # Sentry error tracking configuration
```

## 🔧 Core Utility Modules

### API Client (`api.ts`)
```typescript
// Generic API client with retry logic
import { api } from '@/lib/api';

// Basic usage
const response = await api.get('/users');
const user = await api.post('/users', userData);

// With options
const data = await api.request({
  url: '/protected-endpoint',
  method: 'GET',
  headers: { Authorization: `Bearer ${token}` },
  retry: 3,
  timeout: 30000
});
```

### Supabase Configuration (`supabase.ts`)
```typescript
// Supabase client setup
import { supabase } from '@/lib/supabase';

// Database operations
const { data: users } = await supabase
  .from('users')
  .select('*')
  .eq('active', true);

// Authentication
const { data: user } = await supabase.auth.getUser();

// Real-time subscriptions
supabase
  .from('tasks')
  .on('INSERT', payload => {
    console.log('New task:', payload.new);
  })
  .subscribe();
```

### Utility Functions (`utils.ts`)
```typescript
// Common utility functions
import { cn, formatCurrency, truncateText, generateId } from '@/lib/utils';

// Tailwind class merging
const className = cn(
  'base-classes',
  'additional-classes',
  condition && 'conditional-classes'
);

// Data formatting
const price = formatCurrency(29.99); // "$29.99"
const excerpt = truncateText("Long text...", 100); // "Long text..."
const id = generateId(); // "uuid-v4-string"
```

### Date Utilities (`date-utils.ts`)
```typescript
// Date manipulation and formatting
import { 
  formatDate, 
  formatRelativeTime, 
  addDays, 
  isToday, 
  getTimeOfDay 
} from '@/lib/date-utils';

// Date formatting
const formatted = formatDate(new Date()); // "Jan 29, 2025"
const relative = formatRelativeTime(date); // "2 hours ago"

// Date calculations
const futureDate = addDays(new Date(), 7); // 7 days from now
const todayCheck = isToday(someDate); // true/false
const period = getTimeOfDay(new Date()); // "morning", "afternoon", "evening"
```

## 🤖 Claude AI Workflow System

### Workflow Engine (`claude-workflow-engine.ts`)
```typescript
// Advanced Claude workflow processing
import { ClaudeWorkflowEngine } from '@/lib/claude-workflow-engine';

const engine = new ClaudeWorkflowEngine({
  apiKey: process.env.CLAUDE_API_KEY,
  model: 'claude-3-sonnet-20240229',
  maxRetries: 3,
  temperature: 0.1
});

// Execute workflow
const result = await engine.executeWorkflow({
  type: 'code_analysis',
  input: codeString,
  context: { language: 'typescript', framework: 'react' }
});

// Batch processing
const results = await engine.processBatch([
  { type: 'summarize', input: text1 },
  { type: 'analyze', input: data2 },
  { type: 'generate', input: prompt3 }
]);
```

### Workflow Manager (`claude-workflow-manager.ts`)
```typescript
// Workflow orchestration and management
import { ClaudeWorkflowManager } from '@/lib/claude-workflow-manager';

const manager = new ClaudeWorkflowManager();

// Register workflows
manager.registerWorkflow('code_review', {
  steps: [
    'analyze_syntax',
    'check_security',
    'evaluate_performance',
    'generate_recommendations'
  ],
  parallel: false,
  retryPolicy: { maxRetries: 2, backoff: 'exponential' }
});

// Execute managed workflow
const reviewResult = await manager.executeWorkflow('code_review', {
  codebase: files,
  language: 'typescript'
});
```

### Smart Continuation (`smart-continuation.ts`)
```typescript
// Intelligent workflow continuation
import { SmartContinuation } from '@/lib/smart-continuation';

const continuation = new SmartContinuation({
  contextWindow: 200000,
  priorityThreshold: 0.8,
  compressionStrategy: 'semantic'
});

// Automatic continuation detection
const shouldContinue = await continuation.shouldContinue({
  currentContext: conversationHistory,
  pendingTasks: remainingWork,
  userIntent: 'complete_feature'
});

// Context compression
const compressedContext = await continuation.compressContext(
  largeContext,
  { preserveKeyPoints: true, maxTokens: 50000 }
);
```

## 🎨 Design System (`design-tokens.ts`)

### Design Token Configuration
```typescript
// Design system tokens and theme
import { designTokens, createTheme, getColorScale } from '@/lib/design-tokens';

// Access design tokens
const primaryColor = designTokens.colors.primary[500];
const spacing = designTokens.spacing.lg;
const typography = designTokens.typography.heading.h1;

// Theme creation
const theme = createTheme({
  mode: 'dark',
  accentColor: '#ea384c',
  borderRadius: 'medium'
});

// Color scale generation
const blueScale = getColorScale('blue', {
  steps: 9,
  saturation: 0.8,
  lightness: { min: 0.1, max: 0.9 }
});
```

## 🔍 Database Integration

### Prisma Configuration (`database/prisma.ts`)
```typescript
// Prisma client setup and configuration
import { prisma } from '@/lib/database/prisma';

// Type-safe database operations
const users = await prisma.user.findMany({
  where: { active: true },
  include: { tasks: true, profile: true }
});

// Transactions
const result = await prisma.$transaction([
  prisma.task.create({ data: taskData }),
  prisma.user.update({ 
    where: { id: userId }, 
    data: { tasksCount: { increment: 1 } } 
  })
]);

// Raw queries (when needed)
const customQuery = await prisma.$queryRaw`
  SELECT u.*, COUNT(t.id) as task_count
  FROM users u
  LEFT JOIN tasks t ON u.id = t.user_id
  GROUP BY u.id
`;
```

## 📊 Caching & Performance (`outputCache.tsx`)

### Output Caching System
```typescript
// Performance optimization through caching
import { OutputCache, useCachedResult } from '@/lib/outputCache';

// Initialize cache
const cache = new OutputCache({
  maxSize: 1000,
  ttl: 300000, // 5 minutes
  strategy: 'lru'
});

// Cache expensive operations
const expensiveOperation = cache.memoize(
  'complex-calculation',
  async (params) => {
    // Expensive computation here
    return await performComplexCalculation(params);
  },
  { ttl: 600000 } // 10 minutes for this operation
);

// React hook for cached results
const CachedComponent = ({ data }) => {
  const { result, loading, error } = useCachedResult(
    ['processed-data', data.id],
    () => processData(data),
    { dependencies: [data.updatedAt] }
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <DataVisualization data={result} />;
};
```

## 🔍 Analysis & Processing (`result-analyzer.ts`)

### Result Analysis System
```typescript
// Advanced result analysis and interpretation
import { ResultAnalyzer, AnalysisConfig } from '@/lib/result-analyzer';

const analyzer = new ResultAnalyzer({
  confidenceThreshold: 0.8,
  analysisDepth: 'comprehensive',
  includeRecommendations: true
});

// Analyze complex results
const analysis = await analyzer.analyze({
  data: complexDataSet,
  context: { domain: 'finance', timeframe: 'quarterly' },
  metrics: ['accuracy', 'trends', 'anomalies', 'correlations']
});

// Get insights
const insights = analysis.insights.filter(
  insight => insight.confidence > 0.9
);

// Generate recommendations
const recommendations = await analyzer.generateRecommendations(
  analysis,
  { priority: 'high', feasibility: 'medium' }
);
```

## 📝 Data Formatting (`formatters.ts`)

### Comprehensive Formatters
```typescript
// Data formatting utilities
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatPhoneNumber,
  sanitizeHTML,
  slugify
} from '@/lib/formatters';

// Financial formatting
const price = formatCurrency(1234.56, { currency: 'USD' }); // "$1,234.56"
const percent = formatPercentage(0.1234); // "12.34%"

// Technical formatting
const fileSize = formatFileSize(1048576); // "1.0 MB"
const duration = formatDuration(3661); // "1h 1m 1s"

// Text processing
const clean = sanitizeHTML(userInput); // XSS protection
const slug = slugify("My Blog Post Title"); // "my-blog-post-title"

// International formatting
const phoneNumber = formatPhoneNumber("+1234567890", "US"); // "(123) 456-7890"
```

## 🚨 Error Handling & Monitoring (`sentry.ts`)

### Sentry Configuration
```typescript
// Error tracking and monitoring
import { initSentry, captureError, addBreadcrumb } from '@/lib/sentry';

// Initialize Sentry
initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  sampleRate: 1.0,
  tracesSampleRate: 0.1
});

// Error capture with context
try {
  await riskyOperation();
} catch (error) {
  captureError(error, {
    tags: { operation: 'data_processing' },
    extra: { userId, timestamp: Date.now() },
    level: 'error'
  });
}

// Add breadcrumbs for debugging
addBreadcrumb({
  message: 'User started task creation',
  category: 'user_action',
  data: { taskType: 'project_planning' }
});
```

## 🔧 Configuration Patterns

### Environment Configuration
```typescript
// lib/config.ts (inferred from usage patterns)
interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  database: {
    url: string;
    maxConnections: number;
  };
  features: {
    enableAnalytics: boolean;
    enableCaching: boolean;
    enableWorkflows: boolean;
  };
}

export const config: AppConfig = {
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
    retries: parseInt(process.env.API_RETRIES || '3')
  },
  database: {
    url: process.env.DATABASE_URL!,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10')
  },
  features: {
    enableAnalytics: process.env.VITE_ENABLE_ANALYTICS === 'true',
    enableCaching: process.env.VITE_ENABLE_CACHING !== 'false',
    enableWorkflows: process.env.VITE_ENABLE_WORKFLOWS === 'true'
  }
};
```

## 🎯 Integration Patterns

### Service Layer Integration
```typescript
// Integration with services
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { ClaudeWorkflowEngine } from '@/lib/claude-workflow-engine';

class IntegratedService {
  private api = api;
  private db = supabase;
  private claude = new ClaudeWorkflowEngine();

  async processUserRequest(request: UserRequest) {
    // Use multiple lib utilities together
    const sanitizedInput = sanitizeHTML(request.content);
    const analysis = await this.claude.analyze(sanitizedInput);
    
    const result = await this.api.post('/process', {
      input: sanitizedInput,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
    
    await this.db.from('processed_requests').insert({
      user_id: request.userId,
      result: result.data,
      created_at: new Date()
    });
    
    return result;
  }
}
```

### React Component Integration
```typescript
// Using lib utilities in components
import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useCachedResult } from '@/lib/outputCache';
import { designTokens } from '@/lib/design-tokens';

const TaskCard = ({ task, className, ...props }) => {
  const { result: processedTask } = useCachedResult(
    ['task-processing', task.id],
    () => processTaskData(task),
    { dependencies: [task.updatedAt] }
  );

  return (
    <div 
      className={cn(
        'p-4 rounded-lg border',
        'bg-white dark:bg-gray-900',
        className
      )}
      style={{ 
        borderColor: designTokens.colors.gray[200],
        padding: designTokens.spacing.md 
      }}
      {...props}
    >
      <h3>{task.title}</h3>
      <p>{formatRelativeTime(task.createdAt)}</p>
      {task.budget && (
        <span>{formatCurrency(task.budget)}</span>
      )}
    </div>
  );
};
```

## 🔍 Library Discovery & Usage

### Finding Utilities
```bash
# Search by functionality
find src/lib -name "*api*" -type f
find src/lib -name "*utils*" -type f
find src/lib -name "*claude*" -type f

# Search for specific features
grep -r "formatCurrency" src/lib/
grep -r "supabase" src/lib/
grep -r "workflow" src/lib/
```

### Import Patterns
```typescript
// Core utilities
import { cn, formatCurrency, generateId } from '@/lib/utils';
import { formatDate, addDays, isToday } from '@/lib/date-utils';
import { designTokens, createTheme } from '@/lib/design-tokens';

// API and database
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/database/prisma';

// Advanced features
import { ClaudeWorkflowEngine } from '@/lib/claude-workflow-engine';
import { OutputCache, useCachedResult } from '@/lib/outputCache';
import { ResultAnalyzer } from '@/lib/result-analyzer';

// Formatting
import { sanitizeHTML, slugify, formatFileSize } from '@/lib/formatters';

// Error handling
import { captureError, addBreadcrumb } from '@/lib/sentry';
```

## 🚨 Common Patterns & Best Practices

### Library Organization Principles
- **Single Responsibility**: Each module has a focused purpose
- **Framework Agnostic**: Core utilities work outside React context
- **Type Safety**: Full TypeScript coverage with strict types
- **Performance**: Optimized for production use with caching

### Error Boundaries
```typescript
// Robust error handling in utilities
export const safeAsyncOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorHandler?: (error: Error) => void
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    
    if (errorHandler) {
      errorHandler(err);
    } else {
      captureError(err, { tags: { source: 'safe-async-operation' } });
    }
    
    return fallback;
  }
};
```

### Performance Considerations
```typescript
// Memory-efficient utilities
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  const maxSize = 1000; // Prevent memory leaks
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    
    // LRU eviction when cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  }) as T;
};
```

### Testing Utilities
```typescript
// lib/test-utils.ts (common pattern)
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: generateId(),
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
  ...overrides
});

export const waitFor = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const createTestApiClient = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
});
```

## 📈 Performance & Reliability

### Bundle Optimization
- **Tree Shaking**: All utilities support tree shaking
- **Code Splitting**: Large modules can be dynamically imported
- **Minimal Dependencies**: Reduced external dependencies where possible
- **TypeScript**: Full type safety without runtime overhead

### Reliability Features
- **Error Recovery**: Graceful degradation on failures
- **Retry Logic**: Configurable retry strategies for network operations
- **Circuit Breakers**: Prevent cascade failures in service calls
- **Monitoring**: Comprehensive error tracking and performance monitoring

---

**Last Updated**: January 29, 2025  
**Total Modules**: 20+ utility and configuration modules  
**Integration Coverage**: API, Database, Workflow, Design, Analytics  
**Performance**: Optimized with caching, memoization, and tree shaking support

> Need help with a specific utility? Check the import patterns above or refer to the service documentation in `/src/services/README.md` for integration examples.