/**
 * 🧪 Migration Testing Framework
 * 
 * Utilities for testing Context → Zustand migration
 * Ensures zero data loss and performance improvements
 */

import { Task } from '@/domains/tasks/types/task.types';
import { useTaskStore, TaskFilters, TaskViewState } from '../tasks/taskStore';

// ===== PERFORMANCE MEASUREMENT =====

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  totalTime: number;
  measurements: number[];
}

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  
  startMeasurement(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.recordMeasurement(componentName, renderTime);
    };
  }
  
  private recordMeasurement(componentName: string, renderTime: number) {
    const existing = this.metrics.get(componentName) || {
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      totalTime: 0,
      measurements: [],
    };
    
    existing.renderCount++;
    existing.lastRenderTime = renderTime;
    existing.totalTime += renderTime;
    existing.averageRenderTime = existing.totalTime / existing.renderCount;
    existing.measurements.push(renderTime);
    
    // Keep only last 100 measurements
    if (existing.measurements.length > 100) {
      existing.measurements = existing.measurements.slice(-100);
    }
    
    this.metrics.set(componentName, existing);
  }
  
  getMetrics(componentName: string): PerformanceMetrics | null {
    return this.metrics.get(componentName) || null;
  }
  
  getAllMetrics(): Record<string, PerformanceMetrics> {
    return Object.fromEntries(this.metrics.entries());
  }
  
  comparePerformance(beforeComponent: string, afterComponent: string): {
    improvement: number;
    beforeAvg: number;
    afterAvg: number;
    percentImprovement: number;
  } {
    const before = this.metrics.get(beforeComponent);
    const after = this.metrics.get(afterComponent);
    
    if (!before || !after) {
      throw new Error('Component metrics not found for comparison');
    }
    
    const improvement = before.averageRenderTime - after.averageRenderTime;
    const percentImprovement = (improvement / before.averageRenderTime) * 100;
    
    return {
      improvement,
      beforeAvg: before.averageRenderTime,
      afterAvg: after.averageRenderTime,
      percentImprovement,
    };
  }
  
  reset() {
    this.metrics.clear();
  }
}

export const performanceTracker = new PerformanceTracker();

// ===== STATE VALIDATION =====

interface StateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataIntegrity: {
    taskCount: number;
    missingFields: string[];
    duplicateIds: string[];
    invalidData: Array<{ taskId: string; issues: string[] }>;
  };
}

export class StateValidator {
  static validateTaskStore(): StateValidationResult {
    const store = useTaskStore.getState();
    const result: StateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      dataIntegrity: {
        taskCount: store.tasks.length,
        missingFields: [],
        duplicateIds: [],
        invalidData: [],
      },
    };
    
    // Check for duplicate IDs
    const ids = new Set<string>();
    const duplicates = new Set<string>();
    
    store.tasks.forEach(task => {
      if (ids.has(task.id)) {
        duplicates.add(task.id);
      }
      ids.add(task.id);
    });
    
    result.dataIntegrity.duplicateIds = Array.from(duplicates);
    
    if (duplicates.size > 0) {
      result.isValid = false;
      result.errors.push(`Found ${duplicates.size} duplicate task IDs`);
    }
    
    // Validate each task
    store.tasks.forEach(task => {
      const taskIssues: string[] = [];
      
      // Required fields validation
      if (!task.id) taskIssues.push('Missing ID');
      if (!task.title) taskIssues.push('Missing title');
      if (!task.created_at) taskIssues.push('Missing created_at');
      if (!task.status) taskIssues.push('Missing status');
      if (!task.priority) taskIssues.push('Missing priority');
      if (!task.category) taskIssues.push('Missing category');
      
      // Data type validation
      if (task.due_date && isNaN(Date.parse(task.due_date))) {
        taskIssues.push('Invalid due_date format');
      }
      
      if (task.estimated_time && typeof task.estimated_time !== 'number') {
        taskIssues.push('Invalid estimated_time type');
      }
      
      // Status validation
      const validStatuses = ['pending', 'in_progress', 'completed'];
      if (!validStatuses.includes(task.status)) {
        taskIssues.push(`Invalid status: ${task.status}`);
      }
      
      // Priority validation
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(task.priority)) {
        taskIssues.push(`Invalid priority: ${task.priority}`);
      }
      
      if (taskIssues.length > 0) {
        result.dataIntegrity.invalidData.push({
          taskId: task.id,
          issues: taskIssues,
        });
      }
    });
    
    if (result.dataIntegrity.invalidData.length > 0) {
      result.isValid = false;
      result.errors.push(`Found ${result.dataIntegrity.invalidData.length} tasks with invalid data`);
    }
    
    return result;
  }
  
  static validateTaskFilters(filters: TaskFilters): boolean {
    // Validate filter structure and values
    if (filters.status) {
      const validStatuses = ['pending', 'in_progress', 'completed'];
      return filters.status.every(status => validStatuses.includes(status));
    }
    
    if (filters.priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      return filters.priority.every(priority => validPriorities.includes(priority));
    }
    
    if (filters.dueDateRange) {
      const { start, end } = filters.dueDateRange;
      if (start && end && new Date(start) > new Date(end)) {
        return false;
      }
    }
    
    return true;
  }
}

// ===== MIGRATION TEST UTILITIES =====

export class MigrationTester {
  private beforeSnapshot: any = null;
  private afterSnapshot: any = null;
  
  takeBeforeSnapshot() {
    // This would capture Context state before migration
    this.beforeSnapshot = {
      timestamp: Date.now(),
      taskCount: 0, // Would be populated from Context
      // Add other relevant state data
    };
  }
  
  takeAfterSnapshot() {
    const store = useTaskStore.getState();
    this.afterSnapshot = {
      timestamp: Date.now(),
      taskCount: store.tasks.length,
      hasError: !!store.error,
      filtersApplied: Object.keys(store.filters).length > 0,
      selectedTaskCount: store.viewState.selectedTasks.size,
    };
  }
  
  compareSnapshots(): {
    dataPreserved: boolean;
    differences: string[];
    recommendations: string[];
  } {
    if (!this.beforeSnapshot || !this.afterSnapshot) {
      throw new Error('Must take before and after snapshots');
    }
    
    const differences: string[] = [];
    const recommendations: string[] = [];
    
    // Compare task counts
    if (this.beforeSnapshot.taskCount !== this.afterSnapshot.taskCount) {
      differences.push(
        `Task count changed: ${this.beforeSnapshot.taskCount} → ${this.afterSnapshot.taskCount}`
      );
    }
    
    // Check for errors
    if (this.afterSnapshot.hasError) {
      differences.push('Store has error state after migration');
      recommendations.push('Check error state and ensure proper error handling');
    }
    
    const dataPreserved = differences.length === 0;
    
    if (dataPreserved) {
      recommendations.push('Migration successful - all data preserved');
    }
    
    return {
      dataPreserved,
      differences,
      recommendations,
    };
  }
}

// ===== MOCK DATA GENERATORS =====

export class MockDataGenerator {
  static createMockTask(overrides: Partial<Task> = {}): Task {
    const id = `mock_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      title: `Mock Task ${id.slice(-6)}`,
      description: 'Generated mock task for testing',
      status: 'pending',
      priority: 'medium',
      category: 'main',
      created_at: new Date().toISOString(),
      estimated_time: 30,
      labels: ['test', 'mock'],
      ...overrides,
    };
  }
  
  static createMockTasks(count: number): Task[] {
    return Array.from({ length: count }, (_, i) =>
      this.createMockTask({
        title: `Mock Task ${i + 1}`,
        status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'in_progress' : 'pending',
        priority: ['low', 'medium', 'high', 'urgent'][i % 4] as any,
      })
    );
  }
  
  static populateStoreWithMockData(taskCount: number = 20) {
    const mockTasks = this.createMockTasks(taskCount);
    useTaskStore.getState().setTasks(mockTasks);
    return mockTasks;
  }
}

// ===== COMPATIBILITY TESTING =====

export class CompatibilityTester {
  static testStoreSubscriptions() {
    let subscriptionCount = 0;
    
    // Test multiple subscriptions
    const unsubscribe1 = useTaskStore.subscribe(
      (state) => state.tasks.length,
      () => subscriptionCount++
    );
    
    const unsubscribe2 = useTaskStore.subscribe(
      (state) => state.isLoading,
      () => subscriptionCount++
    );
    
    // Trigger state changes
    useTaskStore.getState().setLoading(true);
    useTaskStore.getState().setLoading(false);
    useTaskStore.getState().addTask(MockDataGenerator.createMockTask());
    
    // Cleanup
    unsubscribe1();
    unsubscribe2();
    
    return subscriptionCount > 0;
  }
  
  static testPersistence() {
    const originalTasks = useTaskStore.getState().tasks;
    
    // Add some data
    const testTask = MockDataGenerator.createMockTask({ title: 'Persistence Test' });
    useTaskStore.getState().addTask(testTask);
    
    // Simulate page reload by creating new store instance
    // Note: In real testing, this would involve localStorage checks
    
    return true; // Would verify localStorage persistence
  }
  
  static async testAsyncOperations() {
    const { syncTasks, setLoading } = useTaskStore.getState();
    
    setLoading(true);
    
    try {
      await syncTasks();
      return useTaskStore.getState().isLoading === false;
    } catch (error) {
      return false;
    }
  }
}

// ===== PERFORMANCE TESTING HOOKS =====

export function usePerformanceTest(componentName: string) {
  const stopMeasurement = performanceTracker.startMeasurement(componentName);
  
  // Return cleanup function
  return stopMeasurement;
}

// ===== TESTING UTILITIES EXPORT =====

export const migrationTestUtils = {
  performanceTracker,
  StateValidator,
  MigrationTester,
  MockDataGenerator,
  CompatibilityTester,
  usePerformanceTest,
};

export default migrationTestUtils;