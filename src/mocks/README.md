# Mocks System 🎭

Mock data, API interceptors, and testing doubles for development and testing environments.

## 🎯 Purpose
Centralized mock system providing realistic test data, API response simulation, and development environment support with comprehensive coverage of all application scenarios.

## 🏗️ Architecture

### Mocks Structure
```typescript
├── api/
│   ├── handlers/            // MSW request handlers
│   ├── responses/           // Mock API response data
│   ├── interceptors/        // Request/response interceptors
│   └── scenarios/           // Predefined API scenarios
├── data/
│   ├── tasks/               // Task-related mock data
│   ├── users/               // User and profile mock data
│   ├── lifelock/           // LifeLock domain mock data
│   ├── analytics/          // Analytics and metrics mock data
│   └── fixtures/           // Reusable data fixtures
├── services/
│   ├── mock-services/       // Service layer mocks
│   ├── storage-mocks/       // Storage and cache mocks
│   ├── auth-mocks/         // Authentication mocks
│   └── notification-mocks/ // Notification system mocks
├── components/
│   ├── storybook/          // Storybook component mocks
│   ├── test-mocks/         // Component testing mocks
│   └── dev-mocks/          // Development environment mocks
└── utils/
    ├── mock-generators/     // Dynamic mock data generators
    ├── scenario-builders/   // Test scenario builders
    ├── faker-extensions/    // Custom Faker.js extensions
    └── mock-utilities/      // Mock helper functions
```

## 📁 Core Mock Systems

### MSW API Handlers
```typescript
// api/handlers/task.handlers.ts - Task API mocking
import { rest } from 'msw';
import { createMockTasks, createMockTask } from '@/mocks/data/tasks/task.factory';
import { TaskStatus, TaskPriority } from '@/constants/enums/task-status.enum';

export const taskHandlers = [
  // Get all tasks with filtering and pagination
  rest.get('/api/tasks', (req, res, ctx) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status') as TaskStatus;
    const priority = url.searchParams.get('priority') as TaskPriority;
    const search = url.searchParams.get('search');

    let tasks = createMockTasks(100); // Generate 100 mock tasks

    // Apply filters
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    if (priority) {
      tasks = tasks.filter(task => task.priority === priority);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    return res(
      ctx.status(200),
      ctx.json({
        data: paginatedTasks,
        pagination: {
          page,
          limit,
          total: tasks.length,
          totalPages: Math.ceil(tasks.length / limit),
          hasNext: endIndex < tasks.length,
          hasPrevious: page > 1
        },
        status: 200,
        message: 'Tasks retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      })
    );
  }),

  // Get task by ID
  rest.get('/api/tasks/:id', (req, res, ctx) => {
    const { id } = req.params;
    const task = createMockTask({ id: id as string });

    return res(
      ctx.status(200),
      ctx.json({
        data: task,
        status: 200,
        message: 'Task retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      })
    );
  }),

  // Create new task
  rest.post('/api/tasks', async (req, res, ctx) => {
    const taskData = await req.json();
    const newTask = createMockTask({
      ...taskData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Simulate processing delay
    await delay(500);

    return res(
      ctx.status(201),
      ctx.json({
        data: newTask,
        status: 201,
        message: 'Task created successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      })
    );
  }),

  // Update task
  rest.patch('/api/tasks/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const updates = await req.json();
    
    const updatedTask = createMockTask({
      ...updates,
      id: id as string,
      updatedAt: new Date()
    });

    // Simulate validation delay
    await delay(300);

    return res(
      ctx.status(200),
      ctx.json({
        data: updatedTask,
        status: 200,
        message: 'Task updated successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      })
    );
  }),

  // Batch update tasks (for UnifiedTaskCard bulk operations)
  rest.patch('/api/tasks/batch', async (req, res, ctx) => {
    const { updates } = await req.json();
    
    const updatedTasks = updates.map((update: any) => 
      createMockTask({
        ...update.data,
        id: update.id,
        updatedAt: new Date()
      })
    );

    // Simulate batch processing delay
    await delay(800);

    return res(
      ctx.status(200),
      ctx.json({
        data: updatedTasks,
        status: 200,
        message: `${updatedTasks.length} tasks updated successfully`,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      })
    );
  }),

  // Delete task
  rest.delete('/api/tasks/:id', async (req, res, ctx) => {
    const { id } = req.params;

    // Simulate processing delay
    await delay(400);

    return res(
      ctx.status(204),
      ctx.json({
        status: 204,
        message: 'Task deleted successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      })
    );
  }),

  // Task search with advanced filtering
  rest.get('/api/tasks/search', (req, res, ctx) => {
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const filters = Object.fromEntries(url.searchParams.entries());

    const tasks = createMockTasks(50).filter(task => {
      // Advanced search logic
      const matchesQuery = !query || 
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description.toLowerCase().includes(query.toLowerCase());

      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (key === 'query') return true;
        return !value || (task as any)[key] === value;
      });

      return matchesQuery && matchesFilters;
    });

    return res(
      ctx.status(200),
      ctx.json({
        data: tasks,
        pagination: {
          page: 1,
          limit: tasks.length,
          total: tasks.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        },
        status: 200,
        message: 'Search completed successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      })
    );
  })
];
```

### LifeLock API Mocking
```typescript
// api/handlers/lifelock.handlers.ts - LifeLock domain mocking
import { rest } from 'msw';
import { 
  createMockLifeLockUser, 
  createMockThreatAlerts, 
  createMockIdentityProfile 
} from '@/mocks/data/lifelock/lifelock.factory';

export const lifelockHandlers = [
  // Get user identity profile
  rest.get('/api/users/:userId/identity', async (req, res, ctx) => {
    const { userId } = req.params;
    const profile = createMockIdentityProfile();

    // Simulate encryption/decryption delay for PII data
    await delay(600);

    return res(
      ctx.status(200),
      ctx.json({
        data: profile,
        status: 200,
        message: 'Identity profile retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        encrypted: true, // Indicates data was encrypted
        decryptionTime: 250 // Simulated decryption time
      })
    );
  }),

  // Get threat alerts with severity filtering
  rest.get('/api/users/:userId/threats', (req, res, ctx) => {
    const { userId } = req.params;
    const url = new URL(req.url);
    const severity = url.searchParams.get('severity') as ThreatSeverity;
    const since = url.searchParams.get('since');
    const limit = parseInt(url.searchParams.get('limit') || '25');

    let alerts = createMockThreatAlerts(50);

    // Apply severity filter
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    // Apply date filter
    if (since) {
      const sinceDate = new Date(since);
      alerts = alerts.filter(alert => new Date(alert.detectedAt) >= sinceDate);
    }

    // Sort by severity and timestamp
    alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    });

    // Apply limit
    alerts = alerts.slice(0, limit);

    return res(
      ctx.status(200),
      ctx.json({
        data: alerts,
        status: 200,
        message: 'Threat alerts retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        metadata: {
          totalAlerts: 50,
          filteredCount: alerts.length,
          highSeverityCount: alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length
        }
      })
    );
  }),

  // Update protection level
  rest.patch('/api/users/:userId/protection', async (req, res, ctx) => {
    const { userId } = req.params;
    const { protectionLevel } = await req.json();

    // Simulate protection level validation and processing
    await delay(1000);

    const config = {
      level: protectionLevel,
      features: PROTECTION_LEVEL_CONFIG[protectionLevel].features,
      monthlyPrice: PROTECTION_LEVEL_CONFIG[protectionLevel].monthlyPrice,
      maxAlerts: PROTECTION_LEVEL_CONFIG[protectionLevel].maxAlerts,
      scanFrequency: PROTECTION_LEVEL_CONFIG[protectionLevel].scanFrequency,
      upgradedAt: new Date().toISOString()
    };

    return res(
      ctx.status(200),
      ctx.json({
        data: config,
        status: 200,
        message: 'Protection level updated successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        audit: {
          action: 'protection_level_upgrade',
          previousLevel: 'basic', // Mock previous level
          newLevel: protectionLevel,
          userId,
          ipAddress: '192.168.1.1'
        }
      })
    );
  }),

  // Specialized endpoints for decomposed hooks (Phase 2)
  rest.get('/api/users/:userId/identity-protection', async (req, res, ctx) => {
    const { userId } = req.params;
    
    // Specialized data for useIdentityProtection hook
    const data = {
      personalInfo: createMockPersonalInfo(),
      creditProfile: createMockCreditProfile(),
      socialSecurityMonitoring: createMockSSNMonitoring(),
      isMonitored: true,
      lastUpdated: new Date().toISOString()
    };

    await delay(400); // Faster than full profile fetch

    return res(
      ctx.status(200),
      ctx.json({
        data,
        status: 200,
        message: 'Identity protection data retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        optimized: true // Indicates this is from decomposed endpoint
      })
    );
  }),

  rest.get('/api/users/:userId/security-monitoring', async (req, res, ctx) => {
    const { userId } = req.params;
    
    // Specialized data for useSecurityMonitoring hook
    const data = {
      threatAlerts: createMockThreatAlerts(10),
      securityStatus: 'secure' as SecurityStatus,
      monitoringEnabled: true,
      lastScanDate: new Date().toISOString(),
      scanFrequency: 'real-time',
      protectionLevel: 'premium'
    };

    await delay(300); // Optimized response time

    return res(
      ctx.status(200),
      ctx.json({
        data,
        status: 200,
        message: 'Security monitoring data retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        optimized: true
      })
    );
  })
];
```

### Mock Data Factories
```typescript
// data/tasks/task.factory.ts - Advanced task mock generation
import { faker } from '@faker-js/faker';
import { TaskStatus, TaskPriority } from '@/constants/enums/task-status.enum';

export const createMockTask = (overrides: Partial<TaskCard> = {}): TaskCard => {
  const status = overrides.status || faker.helpers.enumValue(TaskStatus);
  const priority = overrides.priority || faker.helpers.enumValue(TaskPriority);
  const createdAt = overrides.createdAt || faker.date.past({ years: 1 });
  
  // Generate realistic due dates based on priority
  const dueDate = generateRealisticDueDate(priority, createdAt);
  
  // Generate completion data if task is completed
  const completedAt = status === TaskStatus.COMPLETED 
    ? faker.date.between({ from: createdAt, to: new Date() })
    : undefined;

  return {
    id: faker.string.uuid(),
    title: generateTaskTitle(priority),
    description: generateTaskDescription(),
    status,
    priority,
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
    dueDate,
    completedAt,
    assignee: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.7 }),
    metadata: {
      tags: generateTaskTags(),
      estimatedHours: faker.number.int({ min: 1, max: 40 }),
      actualHours: status === TaskStatus.COMPLETED 
        ? faker.number.int({ min: 1, max: 50 })
        : undefined,
      category: faker.helpers.arrayElement(['development', 'design', 'testing', 'documentation', 'meeting']),
      project: faker.helpers.arrayElement(['SISO Internal', 'LifeLock Integration', 'UI Refactor', 'Performance Optimization']),
      difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard', 'expert']),
      blockedBy: faker.helpers.maybe(() => [faker.string.uuid()], { probability: 0.1 }),
      parentTask: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.3 })
    },
    ...overrides
  };
};

const generateTaskTitle = (priority: TaskPriority): string => {
  const priorityPrefixes = {
    [TaskPriority.LOW]: ['Update', 'Refactor', 'Optimize', 'Clean up'],
    [TaskPriority.MEDIUM]: ['Implement', 'Add', 'Create', 'Build'],
    [TaskPriority.HIGH]: ['Fix', 'Debug', 'Resolve', 'Address'],
    [TaskPriority.URGENT]: ['URGENT:', 'CRITICAL:', 'HOTFIX:', 'EMERGENCY:'],
    [TaskPriority.CRITICAL]: ['CRITICAL BUG:', 'SECURITY FIX:', 'SYSTEM DOWN:', 'DATA LOSS:']
  };

  const actions = [
    'user authentication system',
    'task management interface',
    'LifeLock integration',
    'performance monitoring',
    'error handling',
    'data validation',
    'API endpoint',
    'database migration',
    'UI component',
    'test coverage',
    'documentation',
    'security vulnerability'
  ];

  const prefix = faker.helpers.arrayElement(priorityPrefixes[priority]);
  const action = faker.helpers.arrayElement(actions);
  
  return `${prefix} ${action}`;
};

const generateTaskDescription = (): string => {
  const templates = [
    'This task involves {action} to {goal}. The implementation should {requirement} and ensure {quality}.',
    'We need to {action} because {reason}. This will {benefit} and {impact}.',
    '{action} is required to {goal}. Please {instruction} and {validation}.',
    'The current {system} needs {improvement}. This task will {solution} and {outcome}.'
  ];

  const actions = ['implementing', 'updating', 'fixing', 'optimizing', 'refactoring', 'testing'];
  const goals = ['improve user experience', 'enhance performance', 'fix critical bugs', 'add new functionality', 'improve security'];
  const requirements = ['follow best practices', 'maintain backward compatibility', 'ensure type safety', 'include comprehensive tests'];
  const qualities = ['high performance', 'accessibility compliance', 'mobile responsiveness', 'cross-browser compatibility'];

  const template = faker.helpers.arrayElement(templates);
  
  return template
    .replace('{action}', faker.helpers.arrayElement(actions))
    .replace('{goal}', faker.helpers.arrayElement(goals))
    .replace('{requirement}', faker.helpers.arrayElement(requirements))
    .replace('{quality}', faker.helpers.arrayElement(qualities))
    .replace('{reason}', 'current implementation has limitations')
    .replace('{benefit}', 'improve system reliability')
    .replace('{impact}', 'reduce technical debt')
    .replace('{instruction}', 'follow the existing patterns')
    .replace('{validation}', 'verify all tests pass')
    .replace('{system}', 'user interface')
    .replace('{improvement}', 'better error handling')
    .replace('{solution}', 'implement proper validation')
    .replace('{outcome}', 'prevent future issues');
};

const generateTaskTags = (): string[] => {
  const availableTags = [
    'frontend', 'backend', 'api', 'database', 'ui', 'ux', 'performance',
    'security', 'testing', 'documentation', 'refactor', 'enhancement',
    'bug', 'feature', 'maintenance', 'migration', 'integration', 'optimization'
  ];

  const tagCount = faker.number.int({ min: 0, max: 4 });
  return faker.helpers.arrayElements(availableTags, tagCount);
};

const generateRealisticDueDate = (priority: TaskPriority, createdAt: Date): Date => {
  const now = new Date();
  const daysFromCreation = faker.number.int({ min: 1, max: 30 });
  
  const priorityDays = {
    [TaskPriority.CRITICAL]: 1,
    [TaskPriority.URGENT]: 2,
    [TaskPriority.HIGH]: 7,
    [TaskPriority.MEDIUM]: 14,
    [TaskPriority.LOW]: 30
  };

  const maxDays = priorityDays[priority];
  const daysUntilDue = faker.number.int({ min: 1, max: maxDays });
  
  return new Date(createdAt.getTime() + daysUntilDue * 24 * 60 * 60 * 1000);
};

// Specialized factory functions for different scenarios
export const createUrgentTasks = (count: number): TaskCard[] => {
  return Array.from({ length: count }, () => createMockTask({
    priority: TaskPriority.URGENT,
    status: faker.helpers.arrayElement([TaskStatus.PENDING, TaskStatus.IN_PROGRESS])
  }));
};

export const createOverdueTasks = (count: number): TaskCard[] => {
  return Array.from({ length: count }, () => createMockTask({
    dueDate: faker.date.past({ days: 30 }),
    status: faker.helpers.arrayElement([TaskStatus.PENDING, TaskStatus.IN_PROGRESS])
  }));
};

export const createCompletedTasks = (count: number): TaskCard[] => {
  return Array.from({ length: count }, () => createMockTask({
    status: TaskStatus.COMPLETED,
    completedAt: faker.date.recent({ days: 30 })
  }));
};

export const createTasksForUser = (userId: string, count: number): TaskCard[] => {
  return Array.from({ length: count }, () => createMockTask({
    assignee: userId
  }));
};
```

### Development Mock Scenarios
```typescript
// scenarios/development-scenarios.ts - Predefined development scenarios
export const developmentScenarios = {
  // Empty state scenarios
  emptyDashboard: {
    name: 'Empty Dashboard',
    description: 'No tasks, clean slate for testing',
    data: {
      tasks: [],
      users: [],
      notifications: []
    }
  },

  // High activity scenarios
  highActivity: {
    name: 'High Activity Dashboard',
    description: 'Lots of tasks, alerts, and activity',
    data: {
      tasks: createMockTasks(100),
      threatAlerts: createMockThreatAlerts(25),
      notifications: createMockNotifications(15)
    }
  },

  // Error scenarios
  apiErrors: {
    name: 'API Error Scenarios',
    description: 'Various API error conditions',
    handlers: [
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Database connection failed',
              details: [],
              retryable: true,
              severity: 'high'
            },
            requestId: generateRequestId(),
            timestamp: new Date().toISOString()
          })
        );
      }),

      rest.get('/api/users/:userId/threats', (req, res, ctx) => {
        return res(
          ctx.status(429),
          ctx.json({
            error: {
              code: 'RATE_LIMITED',
              message: 'Too many requests',
              details: ['Rate limit: 100 requests per 15 minutes'],
              retryable: true,
              severity: 'medium',
              retryAfter: 900 // 15 minutes
            },
            requestId: generateRequestId(),
            timestamp: new Date().toISOString()
          })
        );
      })
    ]
  },

  // Performance testing scenarios
  performanceTest: {
    name: 'Performance Testing',
    description: 'Large datasets for performance testing',
    data: {
      tasks: createMockTasks(1000),
      users: createMockUsers(500),
      threatAlerts: createMockThreatAlerts(100)
    },
    delays: {
      fast: 50,    // 50ms response time
      normal: 200, // 200ms response time
      slow: 1000,  // 1s response time
      timeout: 30000 // 30s timeout scenario
    }
  },

  // Feature flag scenarios
  migrationTesting: {
    name: 'Migration Testing',
    description: 'Different feature flag combinations',
    scenarios: [
      {
        name: 'Phase 1 Complete',
        featureFlags: {
          useUnifiedTaskCard: true,
          useTaskCardUtils: true,
          useRefactoredAdminLifeLock: true,
          useRefactoredLifeLockHooks: false,
          useUnifiedThemeSystem: false
        }
      },
      {
        name: 'Phase 2 Testing',
        featureFlags: {
          useUnifiedTaskCard: true,
          useTaskCardUtils: true,
          useRefactoredAdminLifeLock: true,
          useRefactoredLifeLockHooks: true,
          useUnifiedThemeSystem: false
        }
      },
      {
        name: 'Phase 3 Preview',
        featureFlags: {
          useUnifiedTaskCard: true,
          useTaskCardUtils: true,
          useRefactoredAdminLifeLock: true,
          useRefactoredLifeLockHooks: true,
          useUnifiedThemeSystem: true
        }
      }
    ]
  },

  // Security scenarios
  securityTesting: {
    name: 'Security Testing',
    description: 'Various security scenarios and threat simulations',
    data: {
      threatAlerts: [
        createMockThreatAlert({
          severity: ThreatSeverity.CRITICAL,
          type: 'identity-theft',
          title: 'Critical: Identity theft attempt detected',
          status: 'active'
        }),
        createMockThreatAlert({
          severity: ThreatSeverity.HIGH,
          type: 'credit-monitoring',
          title: 'Suspicious credit inquiry detected',
          status: 'investigating'
        }),
        createMockThreatAlert({
          severity: ThreatSeverity.MEDIUM,
          type: 'dark-web',
          title: 'Personal information found on dark web',
          status: 'resolved'
        })
      ]
    }
  }
};

// Scenario manager for easy switching
export class MockScenarioManager {
  private currentScenario: string = 'default';
  private customHandlers: RestHandler[] = [];

  setScenario(scenarioName: string) {
    const scenario = developmentScenarios[scenarioName];
    if (!scenario) {
      throw new Error(`Scenario '${scenarioName}' not found`);
    }

    this.currentScenario = scenarioName;
    
    // Update mock data
    if (scenario.data) {
      this.updateMockData(scenario.data);
    }

    // Update handlers
    if (scenario.handlers) {
      this.customHandlers = scenario.handlers;
      server.use(...scenario.handlers);
    }

    console.log(`Mock scenario changed to: ${scenario.name}`);
  }

  getCurrentScenario(): string {
    return this.currentScenario;
  }

  resetToDefault() {
    this.setScenario('default');
    server.resetHandlers();
  }

  private updateMockData(data: any) {
    // Update in-memory mock data stores
    Object.keys(data).forEach(key => {
      mockDataStore.set(key, data[key]);
    });
  }
}
```

### Service Layer Mocking
```typescript
// services/mock-services/lifelock-mock.service.ts - Service layer mocking
export class MockLifeLockService implements ILifeLockService {
  private mockDelay: number = 300;
  private shouldSimulateErrors: boolean = false;
  private errorRate: number = 0.1; // 10% error rate

  constructor(options: MockServiceOptions = {}) {
    this.mockDelay = options.delay || 300;
    this.shouldSimulateErrors = options.simulateErrors || false;
    this.errorRate = options.errorRate || 0.1;
  }

  async getIdentityProfile(userId: string): Promise<IdentityProfile> {
    await this.simulateNetworkDelay();
    
    if (this.shouldSimulateErrors && Math.random() < this.errorRate) {
      throw new ServiceError('Failed to fetch identity profile', {
        code: 'IDENTITY_FETCH_ERROR',
        retryable: true
      });
    }

    return createMockIdentityProfile();
  }

  async getThreatAlerts(userId: string, filters?: ThreatFilters): Promise<ThreatAlert[]> {
    await this.simulateNetworkDelay();
    
    let alerts = createMockThreatAlerts(20);

    if (filters) {
      if (filters.severity) {
        alerts = alerts.filter(alert => alert.severity === filters.severity);
      }
      if (filters.since) {
        const sinceDate = new Date(filters.since);
        alerts = alerts.filter(alert => new Date(alert.detectedAt) >= sinceDate);
      }
    }

    return alerts.slice(0, 10); // Return max 10 alerts
  }

  async updateProtectionLevel(userId: string, level: ProtectionLevel): Promise<ProtectionConfig> {
    await this.simulateNetworkDelay(1000); // Longer delay for updates
    
    if (this.shouldSimulateErrors && Math.random() < this.errorRate) {
      throw new ServiceError('Failed to update protection level', {
        code: 'PROTECTION_UPDATE_ERROR',
        retryable: true
      });
    }

    return {
      level,
      features: PROTECTION_LEVEL_CONFIG[level].features,
      monthlyPrice: PROTECTION_LEVEL_CONFIG[level].monthlyPrice,
      maxAlerts: PROTECTION_LEVEL_CONFIG[level].maxAlerts,
      scanFrequency: PROTECTION_LEVEL_CONFIG[level].scanFrequency,
      supportLevel: PROTECTION_LEVEL_CONFIG[level].supportLevel,
      upgradedAt: new Date().toISOString()
    };
  }

  // Specialized methods for decomposed hooks (Phase 2 ready)
  async getIdentityProtectionData(userId: string): Promise<IdentityProtectionData> {
    await this.simulateNetworkDelay(200); // Faster for specialized data
    
    return {
      personalInfo: createMockPersonalInfo(),
      creditProfile: createMockCreditProfile(),
      socialSecurityMonitoring: createMockSSNMonitoring(),
      isMonitored: true
    };
  }

  async getSecurityMonitoringData(userId: string): Promise<SecurityMonitoringData> {
    await this.simulateNetworkDelay(150); // Optimized response time
    
    return {
      threatAlerts: createMockThreatAlerts(5),
      securityStatus: SecurityStatus.SECURE,
      monitoringEnabled: true,
      lastScanDate: new Date()
    };
  }

  private async simulateNetworkDelay(customDelay?: number): Promise<void> {
    const delay = customDelay || this.mockDelay;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Mock configuration methods
  setDelay(delay: number): void {
    this.mockDelay = delay;
  }

  setErrorRate(rate: number): void {
    this.errorRate = Math.max(0, Math.min(1, rate));
  }

  enableErrorSimulation(enabled: boolean = true): void {
    this.shouldSimulateErrors = enabled;
  }
}
```

## 🔧 Mock Development Tools

### Mock Data Inspector
```typescript
// utils/mock-inspector.ts - Development tools for mock data
export class MockDataInspector {
  private static instance: MockDataInspector;
  private interceptedRequests: MockRequest[] = [];
  private responseMetrics: Map<string, ResponseMetric[]> = new Map();

  public static getInstance(): MockDataInspector {
    if (!MockDataInspector.instance) {
      MockDataInspector.instance = new MockDataInspector();
    }
    return MockDataInspector.instance;
  }

  public interceptRequest(request: MockRequest): void {
    this.interceptedRequests.push({
      ...request,
      timestamp: new Date(),
      id: generateId()
    });

    // Keep only last 100 requests
    if (this.interceptedRequests.length > 100) {
      this.interceptedRequests = this.interceptedRequests.slice(-100);
    }
  }

  public recordResponseMetric(endpoint: string, duration: number, status: number): void {
    if (!this.responseMetrics.has(endpoint)) {
      this.responseMetrics.set(endpoint, []);
    }

    const metrics = this.responseMetrics.get(endpoint)!;
    metrics.push({
      duration,
      status,
      timestamp: new Date()
    });

    // Keep only last 50 metrics per endpoint
    if (metrics.length > 50) {
      this.responseMetrics.set(endpoint, metrics.slice(-50));
    }
  }

  public getRequestHistory(): MockRequest[] {
    return [...this.interceptedRequests];
  }

  public getEndpointMetrics(endpoint?: string): EndpointMetrics | Record<string, EndpointMetrics> {
    if (endpoint) {
      const metrics = this.responseMetrics.get(endpoint) || [];
      return this.calculateMetrics(metrics);
    }

    const allMetrics: Record<string, EndpointMetrics> = {};
    this.responseMetrics.forEach((metrics, endpointName) => {
      allMetrics[endpointName] = this.calculateMetrics(metrics);
    });

    return allMetrics;
  }

  private calculateMetrics(metrics: ResponseMetric[]): EndpointMetrics {
    if (metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0
      };
    }

    const totalRequests = metrics.length;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;
    const successfulRequests = metrics.filter(m => m.status >= 200 && m.status < 400).length;
    const successRate = successfulRequests / totalRequests;
    const errorRate = 1 - successRate;

    return {
      totalRequests,
      averageResponseTime,
      successRate,
      errorRate,
      p95ResponseTime: this.calculatePercentile(metrics.map(m => m.duration), 95),
      p99ResponseTime: this.calculatePercentile(metrics.map(m => m.duration), 99)
    };
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  public generateReport(): MockingReport {
    return {
      requestHistory: this.getRequestHistory(),
      endpointMetrics: this.getEndpointMetrics() as Record<string, EndpointMetrics>,
      generatedAt: new Date(),
      summary: {
        totalRequests: this.interceptedRequests.length,
        uniqueEndpoints: this.responseMetrics.size,
        averageResponseTime: this.calculateOverallAverageResponseTime(),
        overallSuccessRate: this.calculateOverallSuccessRate()
      }
    };
  }

  private calculateOverallAverageResponseTime(): number {
    let totalDuration = 0;
    let totalRequests = 0;

    this.responseMetrics.forEach(metrics => {
      totalDuration += metrics.reduce((sum, m) => sum + m.duration, 0);
      totalRequests += metrics.length;
    });

    return totalRequests > 0 ? totalDuration / totalRequests : 0;
  }

  private calculateOverallSuccessRate(): number {
    let successfulRequests = 0;
    let totalRequests = 0;

    this.responseMetrics.forEach(metrics => {
      successfulRequests += metrics.filter(m => m.status >= 200 && m.status < 400).length;
      totalRequests += metrics.length;
    });

    return totalRequests > 0 ? successfulRequests / totalRequests : 0;
  }
}
```

### Mock Configuration Manager
```typescript
// utils/mock-config-manager.ts - Centralized mock configuration
export class MockConfigManager {
  private config: MockConfiguration = {
    enabled: process.env.NODE_ENV === 'development',
    scenario: 'default',
    delays: {
      api: 300,
      fileUpload: 1000,
      authentication: 500
    },
    errorRates: {
      api: 0.05,
      network: 0.02,
      timeout: 0.01
    },
    features: {
      simulateOffline: false,
      simulateSlowNetwork: false,
      enableInspector: true,
      enableMetrics: true
    }
  };

  public updateConfig(updates: Partial<MockConfiguration>): void {
    this.config = { ...this.config, ...updates };
    this.applyConfiguration();
  }

  public getConfig(): MockConfiguration {
    return { ...this.config };
  }

  public setScenario(scenario: string): void {
    this.config.scenario = scenario;
    MockScenarioManager.getInstance().setScenario(scenario);
  }

  public setDelay(category: string, delay: number): void {
    this.config.delays[category] = delay;
    this.applyDelayConfiguration();
  }

  public setErrorRate(category: string, rate: number): void {
    this.config.errorRates[category] = Math.max(0, Math.min(1, rate));
    this.applyErrorConfiguration();
  }

  private applyConfiguration(): void {
    if (this.config.features.simulateOffline) {
      this.simulateOfflineMode();
    }

    if (this.config.features.simulateSlowNetwork) {
      this.simulateSlowNetwork();
    }

    this.applyDelayConfiguration();
    this.applyErrorConfiguration();
  }

  private applyDelayConfiguration(): void {
    // Update MSW handlers with new delays
    Object.entries(this.config.delays).forEach(([category, delay]) => {
      mockServiceInstances.forEach(service => {
        if (service.setDelay) {
          service.setDelay(delay);
        }
      });
    });
  }

  private applyErrorConfiguration(): void {
    // Update MSW handlers with new error rates
    Object.entries(this.config.errorRates).forEach(([category, rate]) => {
      mockServiceInstances.forEach(service => {
        if (service.setErrorRate) {
          service.setErrorRate(rate);
        }
      });
    });
  }

  private simulateOfflineMode(): void {
    // Override all handlers to return network errors
    server.use(
      rest.all('*', (req, res, ctx) => {
        return res.networkError('Simulated offline mode');
      })
    );
  }

  private simulateSlowNetwork(): void {
    // Add significant delays to all requests
    const slowDelay = 5000; // 5 seconds
    
    server.use(
      rest.all('*', async (req, res, ctx) => {
        await delay(slowDelay);
        return req.passthrough();
      })
    );
  }
}
```

## 🎯 Migration Integration

### Feature Flag Mock Integration
```typescript
// Integration with migration system mocking
export const migrationMockHandlers = [
  // Feature flag endpoints
  rest.get('/api/feature-flags', (req, res, ctx) => {
    const currentPhase = getCurrentMigrationPhase();
    const flags = getFeatureFlagsForPhase(currentPhase);

    return res(
      ctx.status(200),
      ctx.json({
        data: flags,
        status: 200,
        message: 'Feature flags retrieved successfully',
        timestamp: new Date().toISOString(),
        metadata: {
          currentPhase,
          rolloutStatus: getRolloutStatus(flags)
        }
      })
    );
  }),

  // Performance metrics for migration monitoring
  rest.get('/api/performance-metrics', (req, res, ctx) => {
    const metrics = generateMockPerformanceMetrics();

    return res(
      ctx.status(200),
      ctx.json({
        data: metrics,
        status: 200,
        message: 'Performance metrics retrieved successfully',
        timestamp: new Date().toISOString()
      })
    );
  })
];

const getCurrentMigrationPhase = (): number => {
  // Mock logic to determine current phase
  return 2; // Currently in Phase 2
};

const getFeatureFlagsForPhase = (phase: number): FeatureFlags => {
  const phaseConfigs = {
    1: {
      useUnifiedTaskCard: true,
      useTaskCardUtils: true,
      useRefactoredAdminLifeLock: true,
      useRefactoredLifeLockHooks: false,
      useUnifiedThemeSystem: false
    },
    2: {
      useUnifiedTaskCard: true,
      useTaskCardUtils: true,
      useRefactoredAdminLifeLock: true,
      useRefactoredLifeLockHooks: true,
      useUnifiedThemeSystem: false
    },
    3: {
      useUnifiedTaskCard: true,
      useTaskCardUtils: true,
      useRefactoredAdminLifeLock: true,
      useRefactoredLifeLockHooks: true,
      useUnifiedThemeSystem: true
    }
  };

  return phaseConfigs[phase] || phaseConfigs[1];
};
```

## 🎯 Development Guidelines

### Mock Best Practices
```typescript
// Best practices for mock development
export const mockBestPractices = {
  // Data realism
  dataRealism: {
    principle: 'Mock data should be as realistic as possible',
    examples: [
      'Use realistic names, addresses, and dates',
      'Maintain data relationships and constraints',
      'Include edge cases and error scenarios',
      'Simulate real-world data distributions'
    ]
  },

  // Performance simulation
  performanceSimulation: {
    principle: 'Simulate realistic network conditions',
    guidelines: [
      'Use realistic response times for different operations',
      'Simulate network variability and occasional slowness',
      'Include timeout and error scenarios',
      'Test with different network conditions'
    ]
  },

  // Maintainability
  maintainability: {
    principle: 'Keep mocks maintainable and organized',
    practices: [
      'Use factories for data generation',
      'Organize handlers by domain/feature',
      'Document mock scenarios and their purposes',
      'Keep mock logic simple and predictable'
    ]
  }
};
```

## 🎯 Next Steps
1. **Phase 2A**: Add mocks for decomposed hook endpoints
2. **Phase 2B**: Implement realistic performance simulation
3. **Phase 2C**: Add comprehensive error scenario coverage
4. **Phase 3**: Real-time mock data synchronization
5. **Phase 4**: AI-generated mock scenarios and data

---
*Comprehensive mocking system with realistic data generation and development scenario support*