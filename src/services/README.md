# Services Directory

**50+ service modules for API integration, business logic, and external services**

## 🏗️ Directory Overview

This directory contains all service layer modules that handle API calls, business logic, external integrations, and data processing for the SISO Internal application. Services are organized by domain and functionality.

### 📊 Service Statistics  
- **Total Services**: 50+ service modules (.ts files)
- **Organization**: Feature-based service grouping
- **External Integrations**: Notion, Claude API, GitHub, Telegram, YouTube
- **TypeScript Coverage**: 100% (strict mode)

## 📁 Service Structure

### Core Infrastructure Services

#### Database Layer
```
database/               # Database abstraction and management
├── DatabaseManager.ts         # Main database orchestrator
├── PrismaAdapter.ts           # Prisma ORM integration
├── SupabaseAdapter.ts         # Supabase client adapter
├── types.ts                   # Database type definitions
├── index.ts                   # Unified database exports
└── database-test.ts           # Database testing utilities
```

#### MCP (Model Context Protocol) Services
```
mcp/                    # MCP server integrations
├── [MCP service modules for external AI tool integrations]
```

#### Automation Services
```
automation/             # Automation and workflow services
├── [Automation modules for background processing]
```

### Business Logic Services

#### API & Integration Services
```
api-client.ts                  # Generic API client with retry logic
claude-api.ts                  # Claude AI API integration
notionService.ts               # Notion workspace integration
githubDataStreamer.ts          # GitHub API data streaming
telegram-insights-delivery.ts  # Telegram bot integration
youtube-insights-analyzer.ts   # YouTube analytics processing
workTypeApiClient.ts           # Work classification API
```

#### Authentication & User Management
```
chatMemoryService.ts           # User conversation history
autoTriggerSystem.ts           # Automated user actions
windowManager.ts               # Session and window management
```

### Feature-Specific Services

#### Task & Project Management
```
taskPersistenceService.ts      # Task data persistence
taskPersistenceBackup.ts       # Task backup and recovery
sharedTaskDataService.ts       # Cross-component task sharing
workflowService.ts             # Project workflow automation
appPlanService.ts              # Application planning service
newAppPlanService.ts           # Enhanced app planning
```

#### Gamification & XP System
```
gamificationSystem.ts          # Core gamification engine
gamificationService.ts         # Gamification business logic
advancedGamificationService.ts # Advanced reward mechanics
intelligentXPService.ts        # AI-powered XP allocation
xpEarningService.ts           # XP calculation and tracking
xpStoreService.ts             # XP store and purchases
xpPreviewService.ts           # XP preview and estimation
lossAversionGamification.ts   # Psychology-based rewards
bjFoggBehaviorService.ts      # BJ Fogg behavior model
ethicalSocialPsychologyService.ts # Ethical psychology patterns
neuroplasticityGameEngine.ts  # Brain training gamification
```

#### User Experience & Analytics
```
analyticsService.ts           # User behavior analytics
feedbackService.ts           # User feedback collection
feedbackPredictor.ts         # Predictive feedback analysis
flowStatsService.ts          # User flow analytics
wellnessGuardian.ts          # User wellness monitoring
aiPersonalizationEngine.ts   # AI-driven personalization
culturalAdaptationService.ts # Cultural localization
```

#### Data Processing & Migration
```
dataMigration.ts             # Database migration utilities
mobileSafePersistence.ts     # Mobile-optimized storage
manual-tips-collector.ts     # Manual data collection
claude-tips-extractor.ts     # AI-powered tip extraction
```

#### Voice & Communication
```
voiceService.ts              # Voice interaction processing
lifeLockVoiceTaskProcessor.ts # Voice task automation
dailyPointsService.ts        # Daily scoring system
```

#### Integration Services
```
claudiaIntegrationService.ts # Claudia Lambda integration
```

## 🎯 Service Architecture Patterns

### Standard Service Structure
```typescript
// ServiceName.ts
import { DatabaseManager } from '@/services/database/DatabaseManager';
import { logger } from '@/lib/logger';

interface ServiceConfig {
  // Service-specific configuration
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ServiceName {
  private config: ServiceConfig;
  private db: DatabaseManager;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.db = DatabaseManager.getInstance();
  }

  async performOperation<T>(params: OperationParams): Promise<ServiceResponse<T>> {
    try {
      // Validate input
      // Perform operation
      // Return structured response
      return { success: true, data: result };
    } catch (error) {
      logger.error('ServiceName operation failed', error);
      return { success: false, error: error.message };
    }
  }
}

export default ServiceName;
```

### Database Integration Pattern
```typescript
// Service with database operations
import { DatabaseManager } from '@/services/database/DatabaseManager';

class DataService {
  private db = DatabaseManager.getInstance();

  async createRecord(data: CreateParams) {
    return await this.db.create('tableName', data);
  }

  async findRecords(query: QueryParams) {
    return await this.db.findMany('tableName', query);
  }

  async updateRecord(id: string, data: UpdateParams) {
    return await this.db.update('tableName', id, data);
  }
}
```

### External API Integration Pattern
```typescript
// Service with external API calls
import { api } from '@/services/api-client';

class ExternalService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.EXTERNAL_API_URL!;
    this.apiKey = process.env.EXTERNAL_API_KEY!;
  }

  async fetchData<T>(endpoint: string): Promise<T> {
    return await api.get(`${this.baseURL}/${endpoint}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    });
  }
}
```

## 🔌 Key External Integrations

### Notion API Integration
```typescript
// notionService.ts usage
import { notionService } from '@/services/notionService';

const pages = await notionService.getPages({
  database_id: 'your-database-id'
});

const newPage = await notionService.createPage({
  parent: { database_id: 'database-id' },
  properties: { /* page properties */ }
});
```

### Claude API Integration
```typescript
// claude-api.ts usage
import { claudeApi } from '@/services/claude-api';

const response = await claudeApi.generateResponse({
  messages: [{ role: 'user', content: 'Hello' }],
  model: 'claude-3-sonnet-20240229'
});
```

### Supabase Database Integration
```typescript
// SupabaseAdapter usage
import { DatabaseManager } from '@/services/database/DatabaseManager';

const db = DatabaseManager.getInstance();
const user = await db.findUnique('users', { email: 'user@example.com' });
```

## 🎮 Gamification Services Architecture

### XP System Components
```typescript
// XP Service Integration
import { xpEarningService } from '@/services/xpEarningService';
import { gamificationSystem } from '@/services/gamificationSystem';

// Award XP for task completion
await xpEarningService.awardXP(userId, 'task_completion', taskId);

// Check for level ups and achievements
const rewards = await gamificationSystem.processRewards(userId);
```

### Behavioral Psychology Integration
```typescript
// BJ Fogg Behavior Model
import { bjFoggBehaviorService } from '@/services/bjFoggBehaviorService';

// Analyze behavior triggers
const analysis = await bjFoggBehaviorService.analyzeBehavior({
  motivation: 'high',
  ability: 'medium',
  trigger: 'notification'
});
```

## 📊 Analytics & Feedback Services

### Analytics Collection
```typescript
// analyticsService.ts usage
import { analyticsService } from '@/services/analyticsService';

await analyticsService.trackEvent('page_view', {
  page: '/dashboard',
  user_id: userId,
  timestamp: new Date()
});

const insights = await analyticsService.getUserInsights(userId);
```

### Feedback Processing
```typescript
// feedbackService.ts usage  
import { feedbackService } from '@/services/feedbackService';

await feedbackService.collectFeedback({
  user_id: userId,
  type: 'feature_request',
  content: 'Please add dark mode',
  rating: 4
});

const predictions = await feedbackService.predictIssues(userId);
```

## 🔄 Service Communication Patterns

### Inter-Service Communication
```typescript
// Services communicating with each other
class TaskService {
  async completeTask(taskId: string, userId: string) {
    // Update task status
    await this.updateTaskStatus(taskId, 'completed');
    
    // Award XP through gamification service
    await xpEarningService.awardXP(userId, 'task_completion', taskId);
    
    // Track analytics event
    await analyticsService.trackEvent('task_completed', {
      task_id: taskId,
      user_id: userId
    });
    
    // Trigger workflow automation
    await workflowService.triggerWorkflow('task_completion', {
      taskId, userId
    });
  }
}
```

### Event-Driven Architecture
```typescript
// Event-based service communication
import { EventEmitter } from 'events';

class ServiceEventBus extends EventEmitter {
  static instance = new ServiceEventBus();
  
  static emit(event: string, data: any) {
    this.instance.emit(event, data);
  }
  
  static on(event: string, callback: Function) {
    this.instance.on(event, callback);
  }
}

// Services listen to events
ServiceEventBus.on('task_completed', async (data) => {
  await gamificationSystem.processTaskCompletion(data);
  await analyticsService.trackTaskMetrics(data);
});
```

## 🛡️ Error Handling & Reliability

### Service Error Handling
```typescript
// Standardized error handling
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

class BaseService {
  protected handleError(error: unknown, operation: string) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`${operation} failed:`, { error: errorMessage });
    
    throw new ServiceError(
      `${operation} operation failed`,
      'SERVICE_ERROR',
      500
    );
  }
}
```

### Retry Logic & Circuit Breaker
```typescript
// api-client.ts with retry logic
class ApiClient {
  async request<T>(config: RequestConfig): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.makeRequest<T>(config);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.maxRetries && this.isRetryable(error)) {
          await this.delay(attempt * 1000); // Exponential backoff
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError!;
  }
}
```

## 🔍 Service Discovery & Usage

### Finding Services
```bash
# Search by feature
find src/services -name "*gamification*" -type f
find src/services -name "*xp*" -type f  
find src/services -name "*task*" -type f

# Browse by category
ls src/services/database/
ls src/services/mcp/
ls src/services/automation/
```

### Import Patterns
```typescript
// Database services
import { DatabaseManager } from '@/services/database/DatabaseManager';
import { SupabaseAdapter } from '@/services/database/SupabaseAdapter';

// Business logic services
import { gamificationSystem } from '@/services/gamificationSystem';
import { xpEarningService } from '@/services/xpEarningService';
import { taskPersistenceService } from '@/services/taskPersistenceService';

// Integration services
import { notionService } from '@/services/notionService';
import { claudeApi } from '@/services/claude-api';
import { analyticsService } from '@/services/analyticsService';
```

## 🚨 Common Patterns & Best Practices

### Service Naming Convention
- **PascalCase**: All service classes use PascalCase
- **Descriptive**: Names clearly indicate purpose (e.g., `intelligentXPService`)
- **Domain-based**: Services grouped by business domain

### Dependency Injection Pattern
```typescript
// Service with dependency injection
interface ServiceDependencies {
  database: DatabaseManager;
  logger: Logger;
  eventBus: EventBus;
}

class BusinessService {
  constructor(private deps: ServiceDependencies) {}
  
  async performOperation() {
    try {
      const result = await this.deps.database.query(/* ... */);
      this.deps.eventBus.emit('operation_completed', result);
      return result;
    } catch (error) {
      this.deps.logger.error('Operation failed', error);
      throw error;
    }
  }
}
```

### Configuration Management
```typescript
// Service configuration pattern
interface ServiceConfig {
  apiUrl: string;
  apiKey: string;
  retryAttempts: number;
  timeout: number;
}

class ConfigurableService {
  private config: ServiceConfig;
  
  constructor(config?: Partial<ServiceConfig>) {
    this.config = {
      apiUrl: process.env.API_URL!,
      apiKey: process.env.API_KEY!,
      retryAttempts: 3,
      timeout: 30000,
      ...config
    };
  }
}
```

## 📈 Performance & Monitoring

### Service Performance Patterns
- **Connection Pooling**: Database connections reused efficiently
- **Caching**: Frequently accessed data cached in memory
- **Async Processing**: Background tasks handled asynchronously
- **Rate Limiting**: External API calls throttled appropriately

### Monitoring Integration
```typescript
// Service performance monitoring
import { performance } from 'perf_hooks';

class MonitoredService {
  async trackedOperation(operationName: string, fn: Function) {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      logger.info(`${operationName} completed`, {
        duration: `${duration.toFixed(2)}ms`,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      logger.error(`${operationName} failed`, {
        duration: `${duration.toFixed(2)}ms`,
        error: error.message
      });
      
      throw error;
    }
  }
}
```

## 🔄 Recent Architecture Improvements

### Service Consolidation Benefits
- **Reduced Duplication**: Eliminated duplicate API clients and data services
- **Improved Reliability**: Standardized error handling across all services
- **Better Testing**: Unified service interfaces enable comprehensive testing
- **Enhanced Performance**: Connection pooling and caching optimizations

### Database Layer Unification
- **Multiple Adapters**: Support for both Prisma and Supabase
- **Consistent Interface**: DatabaseManager provides unified API
- **Migration Support**: Seamless switching between database providers
- **Type Safety**: Full TypeScript coverage for all database operations

---

**Last Updated**: January 29, 2025  
**Total Services**: 50+ modules across 3 categories  
**Database Integration**: Prisma + Supabase unified architecture  
**External APIs**: Notion, Claude, GitHub, Telegram, YouTube integrated

> Need help with a specific service? Check the import patterns above or refer to the `/src/types/` directory for service interfaces and type definitions.