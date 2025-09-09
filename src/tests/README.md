# Testing System 🧪

Comprehensive testing framework with unit tests, integration tests, end-to-end tests, and performance testing.

## 🎯 Purpose
Centralized testing infrastructure ensuring code quality, functionality verification, performance validation, and regression prevention across all application layers.

## 🏗️ Architecture

### Testing Structure
```typescript
├── unit/
│   ├── components/          // Component unit tests
│   ├── hooks/               // Custom hook testing
│   ├── services/            // Service layer testing
│   ├── utils/               // Utility function testing
│   └── stores/              // State management testing
├── integration/
│   ├── api/                 // API integration testing
│   ├── workflows/           // User workflow testing
│   ├── features/            // Feature integration testing
│   └── cross-component/     // Component interaction testing
├── e2e/
│   ├── user-flows/          // End-to-end user journeys
│   ├── admin-flows/         // Administrative workflows
│   ├── lifelock-flows/      // LifeLock-specific scenarios
│   └── performance/         // Performance and load testing
├── visual/
│   ├── component-snapshots/ // Visual regression testing
│   ├── storybook-tests/     // Storybook visual testing
│   ├── accessibility/       // A11y testing
│   └── responsive/          // Cross-device testing
├── performance/
│   ├── load-testing/        // Load and stress testing
│   ├── memory-profiling/    // Memory leak detection
│   ├── bundle-analysis/     // Bundle size testing
│   └── vitals-monitoring/   // Web vitals tracking
└── fixtures/
    ├── mock-data/           // Test data fixtures
    ├── scenarios/           // Test scenario definitions
    ├── factories/           // Data factory functions
    └── builders/            // Test data builders
```

## 📁 Core Testing Frameworks

### Unit Testing with Jest and Testing Library
```typescript
// unit/components/UnifiedTaskCard.test.tsx - Component testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { UnifiedTaskCard } from '@/refactored/components/UnifiedTaskCard';
import { createMockTask } from '@/tests/fixtures/task.factory';
import { TestProviders } from '@/tests/utils/test-providers';

describe('UnifiedTaskCard', () => {
  const mockTask = createMockTask({
    title: 'Test Task',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH
  });

  const defaultProps = {
    task: mockTask,
    variant: 'expanded' as const,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onStatusChange: jest.fn()
  };

  const renderComponent = (props = {}) => {
    return render(
      <TestProviders>
        <UnifiedTaskCard {...defaultProps} {...props} />
      </TestProviders>
    );
  };

  describe('Rendering', () => {
    test('should render task title and description', () => {
      renderComponent();
      
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText(mockTask.description)).toBeInTheDocument();
    });

    test('should render correct status indicator', () => {
      renderComponent();
      
      const statusIndicator = screen.getByTestId('task-status-indicator');
      expect(statusIndicator).toHaveStyle({ color: TASK_STATUS_CONFIG[TaskStatus.PENDING].color });
    });

    test('should render priority badge', () => {
      renderComponent();
      
      const priorityBadge = screen.getByTestId('task-priority-badge');
      expect(priorityBadge).toHaveTextContent('High');
      expect(priorityBadge).toHaveStyle({ color: TASK_PRIORITY_CONFIG[TaskPriority.HIGH].color });
    });
  });

  describe('Interactions', () => {
    test('should call onEdit when edit button is clicked', async () => {
      const onEdit = jest.fn();
      renderComponent({ onEdit });
      
      const editButton = screen.getByRole('button', { name: /edit task/i });
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(onEdit).toHaveBeenCalledWith(mockTask);
      });
    });

    test('should call onStatusChange when status is updated', async () => {
      const onStatusChange = jest.fn();
      renderComponent({ onStatusChange });
      
      const statusSelect = screen.getByRole('combobox', { name: /task status/i });
      fireEvent.change(statusSelect, { target: { value: TaskStatus.IN_PROGRESS } });
      
      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith(mockTask.id, TaskStatus.IN_PROGRESS);
      });
    });

    test('should show confirmation dialog before delete', async () => {
      const onDelete = jest.fn();
      renderComponent({ onDelete });
      
      const deleteButton = screen.getByRole('button', { name: /delete task/i });
      fireEvent.click(deleteButton);
      
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      
      const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockTask.id);
      });
    });
  });

  describe('Variants', () => {
    test('should render compact variant correctly', () => {
      renderComponent({ variant: 'compact' });
      
      const container = screen.getByTestId('task-card-container');
      expect(container).toHaveClass('task-card--compact');
    });

    test('should render admin variant with additional controls', () => {
      renderComponent({ variant: 'admin' });
      
      expect(screen.getByRole('button', { name: /admin actions/i })).toBeInTheDocument();
      expect(screen.getByTestId('task-metadata')).toBeInTheDocument();
    });
  });

  describe('Feature Flag Integration', () => {
    test('should use enhanced features when flag is enabled', () => {
      const TestProviderWithFlags = ({ children }) => (
        <TestProviders featureFlags={{ useTaskCardUtils: true }}>
          {children}
        </TestProviders>
      );

      render(
        <TestProviderWithFlags>
          <UnifiedTaskCard {...defaultProps} />
        </TestProviderWithFlags>
      );

      expect(screen.getByTestId('enhanced-task-actions')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      renderComponent();
      
      expect(screen.getByRole('article')).toHaveAttribute('aria-label', `Task: ${mockTask.title}`);
      expect(screen.getByRole('button', { name: /edit task/i })).toHaveAttribute('aria-describedby');
    });

    test('should support keyboard navigation', () => {
      renderComponent();
      
      const editButton = screen.getByRole('button', { name: /edit task/i });
      editButton.focus();
      
      expect(editButton).toHaveFocus();
      
      fireEvent.keyDown(editButton, { key: 'Tab' });
      expect(screen.getByRole('button', { name: /delete task/i })).toHaveFocus();
    });
  });

  describe('Performance', () => {
    test('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const MemoizedCard = React.memo(() => {
        renderSpy();
        return <UnifiedTaskCard {...defaultProps} />;
      });

      const { rerender } = render(<MemoizedCard />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<MemoizedCard />);
      expect(renderSpy).toHaveBeenCalledTimes(1); // Should not re-render
    });
  });
});
```

### Hook Testing
```typescript
// unit/hooks/useLifeLockData.test.ts - Hook testing for Phase 2 migration
import { renderHook, waitFor } from '@testing-library/react';
import { useLifeLockData } from '@/hooks/useLifeLockData';
import { createMockLifeLockUser } from '@/tests/fixtures/lifelock.factory';
import { TestProviders } from '@/tests/utils/test-providers';

describe('useLifeLockData', () => {
  const mockUser = createMockLifeLockUser();
  
  const wrapper = ({ children }) => (
    <TestProviders>
      {children}
    </TestProviders>
  );

  describe('Monolithic Hook (Current)', () => {
    test('should fetch and return all LifeLock data', async () => {
      const { result } = renderHook(() => useLifeLockData(mockUser.id), { wrapper });
      
      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.identity).toBeDefined();
      expect(result.current.security).toBeDefined();
      expect(result.current.threats).toBeDefined();
      expect(result.current.protection).toBeDefined();
    });

    test('should handle errors gracefully', async () => {
      // Mock API error
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useLifeLockData('invalid-id'), { wrapper });
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Decomposed Hooks (Phase 2)', () => {
    test('useIdentityProtection should return identity data only', async () => {
      const { result } = renderHook(() => useIdentityProtection(mockUser.id), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.profile).toBeDefined();
      expect(result.current.updateProfile).toBeInstanceOf(Function);
      expect(result.current.isLoading).toBe(false);
    });

    test('useSecurityMonitoring should return security data only', async () => {
      const { result } = renderHook(() => useSecurityMonitoring(mockUser.id), { wrapper });
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.threatAlerts).toBeDefined();
      expect(result.current.securityStatus).toBeDefined();
      expect(result.current.monitoringEnabled).toBeDefined();
    });

    test('decomposed hooks should have better performance', async () => {
      const startTime = performance.now();
      
      const { result: identityResult } = renderHook(() => useIdentityProtection(mockUser.id), { wrapper });
      
      await waitFor(() => {
        expect(identityResult.current.loading).toBe(false);
      });
      
      const identityTime = performance.now() - startTime;
      
      const monolithicStartTime = performance.now();
      const { result: monolithicResult } = renderHook(() => useLifeLockData(mockUser.id), { wrapper });
      
      await waitFor(() => {
        expect(monolithicResult.current.loading).toBe(false);
      });
      
      const monolithicTime = performance.now() - monolithicStartTime;
      
      // Decomposed hook should be faster for single-purpose usage
      expect(identityTime).toBeLessThan(monolithicTime * 0.6); // 40% faster target
    });
  });

  describe('Feature Flag Migration', () => {
    test('should use decomposed hooks when feature flag is enabled', async () => {
      const TestProviderWithDecomposedFlag = ({ children }) => (
        <TestProviders featureFlags={{ useRefactoredLifeLockHooks: true }}>
          {children}
        </TestProviders>
      );

      const { result } = renderHook(() => useLifeLockData(mockUser.id), { 
        wrapper: TestProviderWithDecomposedFlag 
      });
      
      // Should use the new decomposed implementation
      expect(result.current.isDecomposed).toBe(true);
    });
  });
});
```

### Integration Testing
```typescript
// integration/workflows/task-management.test.ts - Workflow testing
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/tests/utils/test-utils';
import { TaskManagementPage } from '@/pages/TaskManagementPage';
import { createMockTasks } from '@/tests/fixtures/task.factory';
import { server } from '@/tests/mocks/server';

describe('Task Management Workflow', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mockTasks = createMockTasks(10);

  test('complete task creation to completion workflow', async () => {
    renderWithProviders(<TaskManagementPage />);
    
    // Step 1: Create new task
    const createButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(createButton);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: 'Integration Test Task' }
    });
    
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test task created during integration testing' }
    });
    
    fireEvent.change(screen.getByLabelText(/priority/i), {
      target: { value: TaskPriority.HIGH }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save task/i }));
    
    // Step 2: Verify task appears in list
    await waitFor(() => {
      expect(screen.getByText('Integration Test Task')).toBeInTheDocument();
    });
    
    // Step 3: Update task status
    const taskCard = screen.getByText('Integration Test Task').closest('[data-testid="task-card"]');
    const statusSelect = within(taskCard).getByRole('combobox', { name: /status/i });
    
    fireEvent.change(statusSelect, { target: { value: TaskStatus.IN_PROGRESS } });
    
    await waitFor(() => {
      expect(within(taskCard).getByText('In Progress')).toBeInTheDocument();
    });
    
    // Step 4: Complete task
    fireEvent.change(statusSelect, { target: { value: TaskStatus.COMPLETED } });
    
    await waitFor(() => {
      expect(within(taskCard).getByText('Completed')).toBeInTheDocument();
      expect(within(taskCard).getByTestId('completion-timestamp')).toBeInTheDocument();
    });
    
    // Step 5: Verify task statistics updated
    const statsSection = screen.getByTestId('task-statistics');
    expect(within(statsSection).getByText(/1 completed/i)).toBeInTheDocument();
  });

  test('batch task operations workflow', async () => {
    renderWithProviders(<TaskManagementPage />);
    
    // Select multiple tasks
    const taskCheckboxes = screen.getAllByRole('checkbox', { name: /select task/i });
    fireEvent.click(taskCheckboxes[0]);
    fireEvent.click(taskCheckboxes[1]);
    fireEvent.click(taskCheckboxes[2]);
    
    // Verify batch actions appear
    expect(screen.getByText('3 tasks selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /batch update/i })).toBeInTheDocument();
    
    // Perform batch status update
    fireEvent.click(screen.getByRole('button', { name: /batch update/i }));
    fireEvent.change(screen.getByLabelText(/new status/i), {
      target: { value: TaskStatus.IN_PROGRESS }
    });
    fireEvent.click(screen.getByRole('button', { name: /apply to selected/i }));
    
    // Verify all selected tasks updated
    await waitFor(() => {
      const inProgressTasks = screen.getAllByText('In Progress');
      expect(inProgressTasks).toHaveLength(3);
    });
  });

  test('task filtering and search workflow', async () => {
    renderWithProviders(<TaskManagementPage />);
    
    // Test status filter
    const statusFilter = screen.getByRole('combobox', { name: /filter by status/i });
    fireEvent.change(statusFilter, { target: { value: TaskStatus.PENDING } });
    
    await waitFor(() => {
      const taskCards = screen.getAllByTestId('task-card');
      taskCards.forEach(card => {
        expect(within(card).getByText('Pending')).toBeInTheDocument();
      });
    });
    
    // Test search functionality
    const searchInput = screen.getByRole('textbox', { name: /search tasks/i });
    fireEvent.change(searchInput, { target: { value: 'urgent' } });
    
    await waitFor(() => {
      const taskCards = screen.getAllByTestId('task-card');
      taskCards.forEach(card => {
        const title = within(card).getByRole('heading').textContent;
        const description = within(card).getByTestId('task-description').textContent;
        expect(title.toLowerCase() + description.toLowerCase()).toContain('urgent');
      });
    });
    
    // Clear filters
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    
    await waitFor(() => {
      expect(screen.getAllByTestId('task-card')).toHaveLength(mockTasks.length);
    });
  });
});
```

### End-to-End Testing with Playwright
```typescript
// e2e/user-flows/lifelock-protection.spec.ts - E2E testing
import { test, expect } from '@playwright/test';
import { LoginPage } from '@/e2e/page-objects/LoginPage';
import { LifeLockDashboard } from '@/e2e/page-objects/LifeLockDashboard';
import { ProtectionSettingsPage } from '@/e2e/page-objects/ProtectionSettingsPage';

test.describe('LifeLock Protection Management', () => {
  let loginPage: LoginPage;
  let dashboard: LifeLockDashboard;
  let protectionSettings: ProtectionSettingsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboard = new LifeLockDashboard(page);
    protectionSettings = new ProtectionSettingsPage(page);
    
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
  });

  test('should upgrade protection level successfully', async ({ page }) => {
    // Navigate to LifeLock dashboard
    await dashboard.goto();
    await expect(dashboard.protectionLevelBadge).toBeVisible();
    
    // Verify current protection level
    await expect(dashboard.protectionLevelBadge).toContainText('Basic Protection');
    
    // Navigate to protection settings
    await dashboard.clickUpgradeProtection();
    await expect(protectionSettings.upgradeForm).toBeVisible();
    
    // Select premium protection
    await protectionSettings.selectProtectionLevel('premium');
    await protectionSettings.fillBillingInformation({
      cardNumber: '4111111111111111',
      expiryDate: '12/25',
      cvv: '123',
      zipCode: '12345'
    });
    
    // Submit upgrade
    await protectionSettings.submitUpgrade();
    
    // Verify upgrade confirmation
    await expect(page.getByText('Protection upgraded successfully')).toBeVisible();
    
    // Verify new protection level
    await dashboard.goto();
    await expect(dashboard.protectionLevelBadge).toContainText('Premium Protection');
    
    // Verify new features are available
    await expect(dashboard.investmentMonitoringSection).toBeVisible();
    await expect(dashboard.insuranceMonitoringSection).toBeVisible();
  });

  test('should handle threat alerts appropriately', async ({ page }) => {
    await dashboard.goto();
    
    // Check for threat alerts
    const threatCount = await dashboard.getThreatAlertCount();
    
    if (threatCount > 0) {
      // Click on first threat alert
      await dashboard.clickFirstThreatAlert();
      
      // Verify threat details modal
      await expect(dashboard.threatDetailsModal).toBeVisible();
      
      // Verify threat information
      await expect(dashboard.threatSeverityIndicator).toBeVisible();
      await expect(dashboard.threatDescriptionText).toBeVisible();
      
      // Take action on threat
      if (await dashboard.resolveButton.isVisible()) {
        await dashboard.resolveButton.click();
        
        // Verify resolution confirmation
        await expect(page.getByText('Threat marked as resolved')).toBeVisible();
        
        // Verify threat count decreased
        const newThreatCount = await dashboard.getThreatAlertCount();
        expect(newThreatCount).toBe(threatCount - 1);
      }
    }
  });

  test('should display real-time monitoring status', async ({ page }) => {
    await dashboard.goto();
    
    // Verify monitoring status indicators
    await expect(dashboard.identityMonitoringStatus).toBeVisible();
    await expect(dashboard.creditMonitoringStatus).toBeVisible();
    await expect(dashboard.darkWebMonitoringStatus).toBeVisible();
    
    // Verify last scan information
    await expect(dashboard.lastScanTimestamp).toBeVisible();
    
    // Trigger manual scan if available
    if (await dashboard.manualScanButton.isVisible()) {
      await dashboard.manualScanButton.click();
      
      // Verify scan initiation
      await expect(page.getByText('Security scan initiated')).toBeVisible();
      
      // Wait for scan completion (with timeout)
      await expect(dashboard.scanProgressIndicator).toBeVisible();
      await expect(dashboard.scanProgressIndicator).toHaveClass(/complete/, { timeout: 30000 });
    }
  });

  test('should maintain session during navigation', async ({ page }) => {
    await dashboard.goto();
    
    // Navigate through different sections
    await dashboard.navigateToIdentityProtection();
    await expect(page.getByRole('heading', { name: 'Identity Protection' })).toBeVisible();
    
    await dashboard.navigateToThreatMonitoring();
    await expect(page.getByRole('heading', { name: 'Threat Monitoring' })).toBeVisible();
    
    await dashboard.navigateToReports();
    await expect(page.getByRole('heading', { name: 'Protection Reports' })).toBeVisible();
    
    // Verify user remains authenticated
    await expect(dashboard.userProfileMenu).toBeVisible();
    await expect(dashboard.protectionLevelBadge).toBeVisible();
  });

  test('should handle offline scenarios gracefully', async ({ page, context }) => {
    await dashboard.goto();
    
    // Go offline
    await context.setOffline(true);
    
    // Attempt to navigate
    await dashboard.navigateToThreatMonitoring();
    
    // Verify offline message
    await expect(page.getByText(/you are currently offline/i)).toBeVisible();
    
    // Verify cached data still visible
    await expect(dashboard.protectionLevelBadge).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Verify connectivity restored
    await page.reload();
    await expect(dashboard.threatAlertsSection).toBeVisible();
  });
});
```

### Performance Testing
```typescript
// performance/load-testing/component-performance.test.ts
import { render } from '@testing-library/react';
import { UnifiedTaskCard } from '@/refactored/components/UnifiedTaskCard';
import { createMockTasks } from '@/tests/fixtures/task.factory';
import { measurePerformance } from '@/tests/utils/performance-utils';

describe('Component Performance Tests', () => {
  test('UnifiedTaskCard rendering performance', async () => {
    const tasks = createMockTasks(100);
    
    const { renderTime, memoryUsage } = await measurePerformance(async () => {
      tasks.forEach(task => {
        render(<UnifiedTaskCard task={task} variant="compact" />);
      });
    });
    
    // Performance assertions
    expect(renderTime).toBeLessThan(500); // 500ms for 100 cards
    expect(memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB limit
  });

  test('Hook decomposition performance improvement', async () => {
    const userId = 'test-user-id';
    
    // Test monolithic hook performance
    const monolithicPerf = await measurePerformance(async () => {
      const { result } = renderHook(() => useLifeLockData(userId));
      await waitFor(() => !result.current.loading);
    });
    
    // Test decomposed hooks performance
    const decomposedPerf = await measurePerformance(async () => {
      const { result: identityResult } = renderHook(() => useIdentityProtection(userId));
      const { result: securityResult } = renderHook(() => useSecurityMonitoring(userId));
      
      await waitFor(() => !identityResult.current.loading && !securityResult.current.loading);
    });
    
    // Verify performance improvement
    expect(decomposedPerf.renderTime).toBeLessThan(monolithicPerf.renderTime * 0.6); // 40% improvement
    expect(decomposedPerf.memoryUsage).toBeLessThan(monolithicPerf.memoryUsage * 0.55); // 45% improvement
  });

  test('Bundle size impact of feature flags', async () => {
    const bundleAnalysis = await analyzeBundleSize({
      useUnifiedTaskCard: true,
      useRefactoredLifeLockHooks: true,
      useUnifiedThemeSystem: false
    });
    
    // Verify bundle size targets
    expect(bundleAnalysis.totalSize).toBeLessThan(2 * 1024 * 1024); // 2MB limit
    expect(bundleAnalysis.criticalPath).toBeLessThan(200 * 1024); // 200KB critical path
    expect(bundleAnalysis.lazyChunks.every(chunk => chunk.size < 100 * 1024)).toBe(true); // 100KB chunk limit
  });
});
```

## 🔧 Testing Utilities and Fixtures

### Test Data Factories
```typescript
// fixtures/task.factory.ts - Test data generation
export const createMockTask = (overrides: Partial<TaskCard> = {}): TaskCard => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  status: faker.helpers.enumValue(TaskStatus),
  priority: faker.helpers.enumValue(TaskPriority),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  dueDate: faker.date.future(),
  assignee: faker.string.uuid(),
  metadata: {
    tags: faker.helpers.multiple(() => faker.lorem.word(), { count: { min: 0, max: 3 } }),
    estimatedHours: faker.number.int({ min: 1, max: 40 }),
    actualHours: faker.number.int({ min: 0, max: 50 })
  },
  ...overrides
});

export const createMockTasks = (count: number): TaskCard[] => {
  return Array.from({ length: count }, () => createMockTask());
};

export const createTaskWithStatus = (status: TaskStatus): TaskCard => {
  return createMockTask({ status });
};

export const createUrgentTask = (): TaskCard => {
  return createMockTask({
    priority: TaskPriority.URGENT,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due tomorrow
  });
};

// fixtures/lifelock.factory.ts - LifeLock test data
export const createMockLifeLockUser = (overrides: Partial<LifeLockUser> = {}): LifeLockUser => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  protectionLevel: faker.helpers.enumValue(ProtectionLevel),
  identityProfile: createMockIdentityProfile(),
  securityStatus: faker.helpers.enumValue(SecurityStatus),
  threatAlerts: createMockThreatAlerts(5),
  createdAt: faker.date.past(),
  lastLoginAt: faker.date.recent(),
  ...overrides
});

export const createMockThreatAlert = (overrides: Partial<ThreatAlert> = {}): ThreatAlert => ({
  id: faker.string.uuid(),
  severity: faker.helpers.enumValue(ThreatSeverity),
  type: faker.helpers.arrayElement(['identity-theft', 'credit-monitoring', 'dark-web', 'social-security']),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  detectedAt: faker.date.recent(),
  status: faker.helpers.arrayElement(['active', 'investigating', 'resolved']),
  source: faker.helpers.arrayElement(['automated-scan', 'manual-review', 'third-party']),
  ...overrides
});
```

### Test Providers and Utilities
```typescript
// utils/test-providers.tsx - Test environment setup
export const TestProviders: React.FC<{
  children: React.ReactNode;
  featureFlags?: Partial<FeatureFlags>;
  initialState?: Partial<RootState>;
}> = ({ children, featureFlags = {}, initialState = {} }) => {
  const store = createTestStore(initialState);
  const mockFeatureFlags = { ...FEATURE_FLAG_DEFAULTS, ...featureFlags };

  return (
    <Provider store={store}>
      <FeatureFlagsProvider value={mockFeatureFlags}>
        <ThemeProvider theme={lightTheme}>
          <MemoryRouter>
            {children}
          </MemoryRouter>
        </ThemeProvider>
      </FeatureFlagsProvider>
    </Provider>
  );
};

// utils/performance-utils.ts - Performance measurement utilities
export const measurePerformance = async <T>(
  operation: () => Promise<T> | T
): Promise<PerformanceMeasurement> => {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

  const result = await operation();

  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

  return {
    result,
    renderTime: endTime - startTime,
    memoryUsage: endMemory - startMemory,
    timestamp: new Date()
  };
};

export const waitForPerformanceEntry = (name: string): Promise<PerformanceEntry> => {
  return new Promise((resolve) => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const entry = entries.find(e => e.name === name);
      if (entry) {
        observer.disconnect();
        resolve(entry);
      }
    });
    observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
  });
};
```

## 📊 Testing Metrics and Reporting

### Coverage Requirements
```typescript
// jest.config.js - Coverage configuration
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/mocks/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Higher requirements for critical components
    './src/refactored/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/hooks/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

### Test Performance Monitoring
```typescript
// utils/test-performance-monitor.ts
export class TestPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();

  recordTestPerformance(testName: string, duration: number, memoryUsage: number) {
    if (!this.metrics.has(testName)) {
      this.metrics.set(testName, []);
    }

    this.metrics.get(testName)!.push({
      duration,
      memoryUsage,
      timestamp: Date.now()
    });
  }

  generatePerformanceReport(): TestPerformanceReport {
    const report: TestPerformanceReport = {
      totalTests: 0,
      averageDuration: 0,
      slowestTests: [],
      memoryHogs: [],
      performanceTrends: {}
    };

    for (const [testName, metrics] of this.metrics) {
      report.totalTests++;
      
      const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
      const avgMemory = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length;
      
      if (avgDuration > 1000) { // Slow test threshold
        report.slowestTests.push({ testName, duration: avgDuration });
      }
      
      if (avgMemory > 50 * 1024 * 1024) { // Memory threshold
        report.memoryHogs.push({ testName, memoryUsage: avgMemory });
      }
    }

    return report;
  }
}
```

## 🎯 Migration Testing Strategy

### Feature Flag Testing
```typescript
// Feature flag migration testing
describe('Feature Flag Migration Testing', () => {
  test('should maintain functionality with flags disabled', async () => {
    const TestProviderWithDisabledFlags = ({ children }) => (
      <TestProviders featureFlags={{
        useUnifiedTaskCard: false,
        useRefactoredLifeLockHooks: false,
        useUnifiedThemeSystem: false
      }}>
        {children}
      </TestProviders>
    );

    renderWithProviders(<TaskManagementPage />, { 
      wrapper: TestProviderWithDisabledFlags 
    });

    // Should still function with legacy components
    expect(screen.getByTestId('legacy-task-list')).toBeInTheDocument();
  });

  test('should gradually enable features without breaking', async () => {
    // Test progressive feature enablement
    const phases = [
      { useUnifiedTaskCard: true },
      { useUnifiedTaskCard: true, useRefactoredLifeLockHooks: true },
      { useUnifiedTaskCard: true, useRefactoredLifeLockHooks: true, useUnifiedThemeSystem: true }
    ];

    for (const phaseFlags of phases) {
      const { unmount } = renderWithProviders(<App />, {
        featureFlags: phaseFlags
      });

      // Verify app still functions
      expect(screen.getByTestId('app-container')).toBeInTheDocument();
      
      unmount();
    }
  });
});
```

## 🎯 Next Steps
1. **Phase 2A**: Add specialized tests for decomposed hooks
2. **Phase 2B**: Implement comprehensive performance regression testing
3. **Phase 2C**: Add visual regression testing for theme system
4. **Phase 3**: Advanced E2E testing with real device simulation
5. **Phase 4**: AI-assisted test generation and maintenance

---
*Comprehensive testing system ensuring 90% coverage with performance and accessibility validation*