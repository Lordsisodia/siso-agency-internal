/**
 * 🎛️ Task Service Registry - Centralized service management and discovery
 * 
 * This registry provides a single point of access for all task services,
 * implementing the Service Locator pattern for clean dependency management.
 * It handles service instantiation, caching, health monitoring, and routing.
 * 
 * Business Context:
 * As the SISO Internal app grows, we need a way to manage different task services
 * without creating tight coupling between components and specific service implementations.
 * This registry allows components to request services by type, while the registry
 * handles the complexity of service creation, caching, and lifecycle management.
 * 
 * Key Benefits:
 * - Single responsibility for service management
 * - Lazy loading of services for better performance
 * - Health monitoring and automatic recovery
 * - Easy addition of new task types without code changes
 * - Centralized configuration and feature flags
 * - Service metrics and monitoring integration
 */

import { BaseTaskService } from './BaseTaskService';
import { LightWorkTaskService } from './LightWorkTaskService';
import { DeepWorkTaskService } from './DeepWorkTaskService';
import { Task } from '@/components/tasks/TaskCard';

// Service registration metadata
// This provides information about each service for monitoring and management
interface ServiceRegistration {
  instance: BaseTaskService;
  created: Date;
  lastUsed: Date;
  usageCount: number;
  isHealthy: boolean;
  errorCount: number;
  lastError?: Error;
}

// Health check result for service monitoring
// Provides detailed information about service status for debugging
interface ServiceHealthResult {
  serviceType: string;
  isHealthy: boolean;
  responseTime: number;
  lastChecked: Date;
  errorMessage?: string;
  taskCount?: number;
}

// Overall registry health status
// Aggregates individual service health for system monitoring
interface RegistryHealthStatus {
  overall: boolean;
  services: Record<string, ServiceHealthResult>;
  timestamp: Date;
  registeredServices: number;
  healthyServices: number;
}

// Configuration for service behavior
// Allows customization of service management without code changes
interface ServiceConfig {
  enableHealthChecks: boolean;
  healthCheckInterval: number;
  maxErrorCount: number;
  enableServiceMetrics: boolean;
  enableLazyLoading: boolean;
}

/**
 * Central registry that manages all task service instances.
 * Implements singleton pattern to ensure consistent service access
 * across the application while providing health monitoring and metrics.
 */
export class TaskServiceRegistry {
  // Map of service type to registration metadata
  // This tracks all registered services and their status
  private services: Map<string, ServiceRegistration> = new Map();
  
  // Registry configuration with sensible defaults
  // Can be overridden for different environments or use cases
  private config: ServiceConfig = {
    enableHealthChecks: true,
    healthCheckInterval: 5 * 60 * 1000, // 5 minutes
    maxErrorCount: 5,
    enableServiceMetrics: true,
    enableLazyLoading: true
  };
  
  // Health check timer for automatic monitoring
  // Runs periodic checks to ensure services remain healthy
  private healthCheckTimer?: NodeJS.Timeout;
  
  // Service creation factories for lazy loading
  // This allows services to be created only when needed
  private serviceFactories: Map<string, () => BaseTaskService> = new Map();

  constructor(config?: Partial<ServiceConfig>) {
    // Apply custom configuration if provided
    // This allows different registry instances for different environments
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Register service factories for lazy loading
    // Services are created only when first requested
    this.registerServiceFactory('light-work', () => new LightWorkTaskService());
    this.registerServiceFactory('deep-work', () => new DeepWorkTaskService());

    // Start health monitoring if enabled
    // This provides proactive service health management
    if (this.config.enableHealthChecks) {
      this.startHealthMonitoring();
    }
  }

  /**
   * Register a service factory for lazy instantiation.
   * This allows services to be created only when first needed,
   * improving startup performance and memory usage.
   */
  private registerServiceFactory(type: string, factory: () => BaseTaskService): void {
    this.serviceFactories.set(type, factory);
  }

  /**
   * Get or create a service instance for the specified task type.
   * Implements lazy loading - services are created on first access.
   * Also tracks usage metrics and health status.
   */
  getService(taskType: string): BaseTaskService {
    // Check if service is already instantiated
    let registration = this.services.get(taskType);

    if (!registration) {
      // Lazy loading: create service on first access
      // This improves startup performance by only creating needed services
      const factory = this.serviceFactories.get(taskType);
      if (!factory) {
        const error = new Error(`No service registered for task type: ${taskType}. Available types: ${this.getRegisteredTypes().join(', ')}`);
        console.error('❌ Service not found:', error.message);
        throw error;
      }

      const serviceInstance = factory();

      // Create registration metadata
      registration = {
        instance: serviceInstance,
        created: new Date(),
        lastUsed: new Date(),
        usageCount: 0,
        isHealthy: true,
        errorCount: 0
      };

      this.services.set(taskType, registration);
    }

    // Update usage metrics
    // This helps identify which services are most used for optimization
    registration.lastUsed = new Date();
    registration.usageCount++;

    return registration.instance;
  }

  /**
   * Register a pre-instantiated service (for testing or special cases).
   * This bypasses lazy loading and registers a service immediately.
   */
  registerService(type: string, service: BaseTaskService): void {
    const registration: ServiceRegistration = {
      instance: service,
      created: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      isHealthy: true,
      errorCount: 0
    };

    this.services.set(type, registration);
  }

  /**
   * Get all registered task types.
   * Includes both instantiated services and factory-registered types.
   */
  getRegisteredTypes(): string[] {
    // Combine instantiated services and factory registrations
    // This provides a complete view of available service types
    const instantiatedTypes = Array.from(this.services.keys());
    const factoryTypes = Array.from(this.serviceFactories.keys());

    // Remove duplicates and return sorted list
    const allTypes = [...new Set([...instantiatedTypes, ...factoryTypes])].sort();

    return allTypes;
  }

  /**
   * Check if a service type is available.
   * Useful for conditional feature enablement.
   */
  hasService(taskType: string): boolean {
    return this.services.has(taskType) || this.serviceFactories.has(taskType);
  }

  /**
   * Perform health checks on all instantiated services.
   * This helps identify problematic services before they affect users.
   */
  async performHealthCheck(): Promise<RegistryHealthStatus> {
    const serviceResults: Record<string, ServiceHealthResult> = {};
    let healthyCount = 0;
    const totalServices = this.services.size;

    // Check each instantiated service
    // Only check services that have been created to avoid unnecessary instantiation
    for (const [type, registration] of this.services) {
      const startTime = Date.now();
      let result: ServiceHealthResult;

      try {
        // Perform a lightweight health check
        // Try to get tasks without specifying a user to test basic functionality
        const tasks = await registration.instance.getTasks();
        const responseTime = Date.now() - startTime;

        result = {
          serviceType: type,
          isHealthy: true,
          responseTime,
          lastChecked: new Date(),
          taskCount: tasks.length
        };

        // Update registration health status
        registration.isHealthy = true;
        registration.errorCount = 0;
        healthyCount++;

      } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = (error as Error).message;

        result = {
          serviceType: type,
          isHealthy: false,
          responseTime,
          lastChecked: new Date(),
          errorMessage
        };

        // Update registration error tracking
        registration.isHealthy = false;
        registration.errorCount++;
        registration.lastError = error as Error;

        console.error(`❌ ${type} service unhealthy (${responseTime}ms): ${errorMessage}`);

        // If error count exceeds threshold, consider additional actions
        if (registration.errorCount >= this.config.maxErrorCount) {
          console.warn(`⚠️ Service ${type} has exceeded error threshold (${this.config.maxErrorCount})`);
          // Could implement automatic service recreation or circuit breaker here
        }
      }

      serviceResults[type] = result;
    }

    // Compile overall health status
    const overallHealth = healthyCount === totalServices && totalServices > 0;

    const healthStatus: RegistryHealthStatus = {
      overall: overallHealth,
      services: serviceResults,
      timestamp: new Date(),
      registeredServices: totalServices,
      healthyServices: healthyCount
    };

    return healthStatus;
  }

  /**
   * Start automatic health monitoring.
   * Runs periodic health checks to proactively identify issues.
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      return;
    }

    this.healthCheckTimer = setInterval(async () => {
      try {
        const healthStatus = await this.performHealthCheck();

        // Log summary of health status only when there are issues
        if (!healthStatus.overall) {
          console.warn(`⚠️ Registry health issue: ${healthStatus.healthyServices}/${healthStatus.registeredServices} services healthy`);
        }

      } catch (error) {
        console.error('❌ Health monitoring error:', error);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop automatic health monitoring.
   * Useful for cleanup during application shutdown.
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Get service usage statistics.
   * Useful for optimization and capacity planning.
   */
  getServiceMetrics(): Record<string, { usageCount: number; lastUsed: Date; errorCount: number }> {
    const metrics: Record<string, { usageCount: number; lastUsed: Date; errorCount: number }> = {};

    for (const [type, registration] of this.services) {
      metrics[type] = {
        usageCount: registration.usageCount,
        lastUsed: registration.lastUsed,
        errorCount: registration.errorCount
      };
    }

    return metrics;
  }

  /**
   * Reset error counts for all services.
   * Useful for recovery after resolving system issues.
   */
  resetErrorCounts(): void {
    let resetCount = 0;
    for (const [type, registration] of this.services) {
      if (registration.errorCount > 0) {
        registration.errorCount = 0;
        registration.lastError = undefined;
        registration.isHealthy = true;
        resetCount++;
      }
    }
  }

  /**
   * Shut down the registry and clean up resources.
   * Important for proper application lifecycle management.
   */
  shutdown(): void {
    // Stop health monitoring
    this.stopHealthMonitoring();

    // Clear service registrations
    this.services.clear();
    this.serviceFactories.clear();
  }

  /**
   * Get a detailed status report for debugging and monitoring.
   * Provides comprehensive information about registry state.
   */
  getStatusReport(): {
    registeredTypes: string[];
    instantiatedServices: number;
    totalFactories: number;
    healthyServices: number;
    config: ServiceConfig;
    uptime: number;
  } {
    const healthyServices = Array.from(this.services.values())
      .filter(reg => reg.isHealthy).length;
    
    return {
      registeredTypes: this.getRegisteredTypes(),
      instantiatedServices: this.services.size,
      totalFactories: this.serviceFactories.size,
      healthyServices,
      config: this.config,
      uptime: Date.now() - (this.services.size > 0 ? 
        Math.min(...Array.from(this.services.values()).map(r => r.created.getTime())) : 
        Date.now())
    };
  }
}

/**
 * Create and configure the global service registry instance.
 * This singleton provides consistent service access across the application.
 */
function createTaskServiceRegistry(): TaskServiceRegistry {
  // Use different configuration for different environments
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const config: Partial<ServiceConfig> = {
    enableHealthChecks: true,
    healthCheckInterval: isDevelopment ? 60000 : 300000, // 1min dev, 5min prod
    maxErrorCount: isDevelopment ? 10 : 5, // More tolerance in dev
    enableServiceMetrics: true,
    enableLazyLoading: true
  };
  
  return new TaskServiceRegistry(config);
}

/**
 * Global registry instance - singleton pattern.
 * This ensures consistent service access across the entire application
 * while providing centralized configuration and monitoring.
 */
export const taskServiceRegistry = createTaskServiceRegistry();

/**
 * Convenience function to get a service by type.
 * Provides a simple API for components that need task services.
 */
export function getTaskService(taskType: string): BaseTaskService {
  return taskServiceRegistry.getService(taskType);
}

/**
 * Convenience function to check service availability.
 * Useful for feature flags and conditional rendering.
 */
export function hasTaskService(taskType: string): boolean {
  return taskServiceRegistry.hasService(taskType);
}

/**
 * Get current registry health status.
 * Useful for health check endpoints and monitoring dashboards.
 */
export async function getRegistryHealth(): Promise<RegistryHealthStatus> {
  return await taskServiceRegistry.performHealthCheck();
}

// Export types for use by other modules
export type { ServiceHealthResult, RegistryHealthStatus, ServiceConfig };