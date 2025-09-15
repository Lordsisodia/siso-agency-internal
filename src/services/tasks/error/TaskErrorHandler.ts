/**
 * ⚠️ Task Error Handler - Comprehensive error management for task operations
 * 
 * This module provides centralized error handling for all task management operations.
 * It implements sophisticated error classification, recovery strategies, retry logic,
 * and detailed error reporting for both light work and deep work scenarios.
 * 
 * Business Context:
 * Error handling is critical for task management reliability:
 * - Database connection failures during task operations
 * - Validation errors for user input and data integrity
 * - Network timeouts and service unavailability
 * - Concurrency conflicts and data consistency issues
 * - Performance degradation and resource exhaustion
 * 
 * Error Categories:
 * - Recoverable errors with automatic retry
 * - User errors requiring input correction
 * - System errors requiring administrator attention
 * - Critical errors requiring immediate escalation
 * - Performance warnings for optimization
 */

// Error severity levels
type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error categories for classification
type ErrorCategory = 
  | 'validation'
  | 'database'
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'business_logic'
  | 'system'
  | 'performance'
  | 'external_service';

// Error context information
interface ErrorContext {
  operation: string;
  taskType?: 'light-work' | 'deep-work';
  taskId?: string;
  userId?: string;
  timestamp: Date;
  requestId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

// Structured error information
interface TaskError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  code: string;
  context: ErrorContext;
  originalError?: Error;
  stack?: string;
  recoverable: boolean;
  retryable: boolean;
  userMessage: string;
  technicalDetails: string;
  suggestedActions: string[];
  relatedErrors?: string[];
}

// Error handling result
interface ErrorHandlingResult {
  handled: boolean;
  recovered: boolean;
  shouldRetry: boolean;
  retryDelay?: number;
  userMessage: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  escalate: boolean;
  metadata: {
    errorId: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    handlingTime: number;
  };
}

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableCategories: ErrorCategory[];
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableCategories: ['database', 'network', 'external_service']
};

// Error code mappings
const ERROR_CODES = {
  // Validation errors (1000-1999)
  VALIDATION_REQUIRED_FIELD: '1001',
  VALIDATION_INVALID_FORMAT: '1002',
  VALIDATION_LENGTH_EXCEEDED: '1003',
  VALIDATION_BUSINESS_RULE: '1004',
  
  // Database errors (2000-2999)
  DATABASE_CONNECTION_FAILED: '2001',
  DATABASE_QUERY_TIMEOUT: '2002',
  DATABASE_CONSTRAINT_VIOLATION: '2003',
  DATABASE_TRANSACTION_FAILED: '2004',
  
  // Network errors (3000-3999)
  NETWORK_TIMEOUT: '3001',
  NETWORK_CONNECTION_REFUSED: '3002',
  NETWORK_DNS_RESOLUTION: '3003',
  
  // Authentication/Authorization (4000-4999)
  AUTH_TOKEN_EXPIRED: '4001',
  AUTH_INVALID_CREDENTIALS: '4002',
  AUTH_INSUFFICIENT_PERMISSIONS: '4003',
  
  // Business logic errors (5000-5999)
  BUSINESS_TASK_NOT_FOUND: '5001',
  BUSINESS_INVALID_STATE_TRANSITION: '5002',
  BUSINESS_DEPENDENCY_CONFLICT: '5003',
  
  // System errors (6000-6999)
  SYSTEM_RESOURCE_EXHAUSTED: '6001',
  SYSTEM_SERVICE_UNAVAILABLE: '6002',
  SYSTEM_CONFIGURATION_ERROR: '6003',
  
  // Performance warnings (7000-7999)
  PERFORMANCE_SLOW_QUERY: '7001',
  PERFORMANCE_HIGH_MEMORY: '7002',
  PERFORMANCE_RATE_LIMIT: '7003'
} as const;

/**
 * Task Error Handler - Centralized error management for task operations.
 * 
 * This class provides comprehensive error handling with intelligent classification,
 * recovery strategies, and detailed reporting. It supports both automated error
 * recovery and escalation for issues requiring human intervention.
 */
export class TaskErrorHandler {
  private static errorHistory: Map<string, TaskError[]> = new Map();
  private static retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;

  /**
   * Handle an error with automatic classification and recovery.
   */
  static handleError(
    error: Error | unknown,
    context: ErrorContext,
    customRetryConfig?: Partial<RetryConfig>
  ): ErrorHandlingResult {
    const startTime = Date.now();
    
    try {
      // Create structured error object
      const taskError = this.createTaskError(error, context);
      
      // Log the error for tracking
      this.logError(taskError);
      
      // Store error in history for analysis
      this.storeErrorHistory(taskError);
      
      // Determine handling strategy
      const handlingStrategy = this.determineHandlingStrategy(taskError, customRetryConfig);
      
      const handlingTime = Date.now() - startTime;
      
      console.log(`⚠️ Error handled: ${taskError.code} (${handlingTime}ms, ${handlingStrategy.shouldRetry ? 'retryable' : 'final'})`);
      
      return {
        ...handlingStrategy,
        metadata: {
          errorId: taskError.id,
          category: taskError.category,
          severity: taskError.severity,
          handlingTime
        }
      };
      
    } catch (handlingError) {
      console.error('❌ Error handling failed:', handlingError);
      
      // Fallback error handling
      return {
        handled: false,
        recovered: false,
        shouldRetry: false,
        userMessage: 'An unexpected error occurred. Please try again.',
        logLevel: 'error',
        escalate: true,
        metadata: {
          errorId: 'unknown',
          category: 'system',
          severity: 'critical',
          handlingTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Handle validation errors with detailed field-level feedback.
   */
  static handleValidationError(
    validationErrors: string[],
    context: ErrorContext
  ): ErrorHandlingResult {
    const taskError = this.createValidationError(validationErrors, context);
    
    this.logError(taskError);
    
    return {
      handled: true,
      recovered: false,
      shouldRetry: false,
      userMessage: taskError.userMessage,
      logLevel: 'warn',
      escalate: false,
      metadata: {
        errorId: taskError.id,
        category: taskError.category,
        severity: taskError.severity,
        handlingTime: 0
      }
    };
  }

  /**
   * Handle database operation errors with connection recovery.
   */
  static handleDatabaseError(
    error: Error,
    context: ErrorContext,
    query?: string
  ): ErrorHandlingResult {
    const enhancedContext = {
      ...context,
      additionalData: {
        ...context.additionalData,
        query: query?.substring(0, 200) // Truncate for logging
      }
    };

    const taskError = this.createDatabaseError(error, enhancedContext);
    
    this.logError(taskError);
    this.storeErrorHistory(taskError);
    
    // Database errors are often retryable
    const shouldRetry = this.isDatabaseErrorRetryable(error);
    const retryDelay = shouldRetry ? this.calculateRetryDelay(1) : undefined;
    
    return {
      handled: true,
      recovered: false,
      shouldRetry,
      retryDelay,
      userMessage: taskError.userMessage,
      logLevel: taskError.severity === 'critical' ? 'error' : 'warn',
      escalate: taskError.severity === 'critical',
      metadata: {
        errorId: taskError.id,
        category: taskError.category,
        severity: taskError.severity,
        handlingTime: 0
      }
    };
  }

  /**
   * Handle network errors with exponential backoff retry.
   */
  static handleNetworkError(
    error: Error,
    context: ErrorContext,
    attemptNumber: number = 1
  ): ErrorHandlingResult {
    const taskError = this.createNetworkError(error, context);
    
    this.logError(taskError);
    
    const shouldRetry = attemptNumber < this.retryConfig.maxAttempts;
    const retryDelay = shouldRetry ? this.calculateRetryDelay(attemptNumber) : undefined;
    
    return {
      handled: true,
      recovered: false,
      shouldRetry,
      retryDelay,
      userMessage: taskError.userMessage,
      logLevel: shouldRetry ? 'warn' : 'error',
      escalate: !shouldRetry,
      metadata: {
        errorId: taskError.id,
        category: taskError.category,
        severity: taskError.severity,
        handlingTime: 0
      }
    };
  }

  /**
   * Handle business logic errors with context-specific messaging.
   */
  static handleBusinessLogicError(
    error: Error,
    context: ErrorContext,
    businessRule?: string
  ): ErrorHandlingResult {
    const enhancedContext = {
      ...context,
      additionalData: {
        ...context.additionalData,
        businessRule
      }
    };

    const taskError = this.createBusinessLogicError(error, enhancedContext);
    
    this.logError(taskError);
    
    return {
      handled: true,
      recovered: false,
      shouldRetry: false,
      userMessage: taskError.userMessage,
      logLevel: 'warn',
      escalate: false,
      metadata: {
        errorId: taskError.id,
        category: taskError.category,
        severity: taskError.severity,
        handlingTime: 0
      }
    };
  }

  /**
   * Get error statistics for monitoring and analysis.
   */
  static getErrorStatistics(timeWindow: number = 3600000): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    topErrors: { code: string; count: number; message: string }[];
    averageHandlingTime: number;
  } {
    const now = Date.now();
    const cutoff = now - timeWindow;
    
    const recentErrors: TaskError[] = [];
    
    for (const errors of this.errorHistory.values()) {
      recentErrors.push(...errors.filter(e => e.context.timestamp.getTime() > cutoff));
    }
    
    const errorsByCategory = recentErrors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<ErrorCategory, number>);
    
    const errorsBySeverity = recentErrors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);
    
    const errorCounts = recentErrors.reduce((acc, error) => {
      const key = error.code;
      acc[key] = (acc[key] || { count: 0, message: error.message });
      acc[key].count++;
      return acc;
    }, {} as Record<string, { count: number; message: string }>);
    
    const topErrors = Object.entries(errorCounts)
      .map(([code, data]) => ({ code, count: data.count, message: data.message }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      totalErrors: recentErrors.length,
      errorsByCategory,
      errorsBySeverity,
      topErrors,
      averageHandlingTime: 0 // Would calculate from actual handling times
    };
  }

  /**
   * Clear error history for cleanup.
   */
  static clearErrorHistory(olderThan?: Date): void {
    if (olderThan) {
      for (const [key, errors] of this.errorHistory) {
        const filteredErrors = errors.filter(e => e.context.timestamp > olderThan);
        if (filteredErrors.length > 0) {
          this.errorHistory.set(key, filteredErrors);
        } else {
          this.errorHistory.delete(key);
        }
      }
    } else {
      this.errorHistory.clear();
    }
    
    console.log('🧹 Error history cleared');
  }

  // Private helper methods

  private static createTaskError(error: Error | unknown, context: ErrorContext): TaskError {
    const errorId = this.generateErrorId();
    const originalError = error instanceof Error ? error : new Error(String(error));
    
    // Classify the error
    const category = this.classifyError(originalError);
    const severity = this.determineSeverity(category, originalError);
    const code = this.getErrorCode(category, originalError);
    
    return {
      id: errorId,
      category,
      severity,
      message: originalError.message,
      code,
      context,
      originalError,
      stack: originalError.stack,
      recoverable: this.isRecoverable(category),
      retryable: this.isRetryable(category),
      userMessage: this.generateUserMessage(category, originalError),
      technicalDetails: this.generateTechnicalDetails(originalError),
      suggestedActions: this.generateSuggestedActions(category, originalError)
    };
  }

  private static createValidationError(validationErrors: string[], context: ErrorContext): TaskError {
    const errorId = this.generateErrorId();
    
    return {
      id: errorId,
      category: 'validation',
      severity: 'medium',
      message: `Validation failed: ${validationErrors.join(', ')}`,
      code: ERROR_CODES.VALIDATION_REQUIRED_FIELD,
      context,
      recoverable: true,
      retryable: false,
      userMessage: `Please correct the following issues: ${validationErrors.join(', ')}`,
      technicalDetails: `Validation errors: ${JSON.stringify(validationErrors)}`,
      suggestedActions: ['Review and correct the input data', 'Ensure all required fields are provided']
    };
  }

  private static createDatabaseError(error: Error, context: ErrorContext): TaskError {
    const errorId = this.generateErrorId();
    
    return {
      id: errorId,
      category: 'database',
      severity: this.isDatabaseConnectionError(error) ? 'high' : 'medium',
      message: error.message,
      code: this.getDatabaseErrorCode(error),
      context,
      originalError: error,
      stack: error.stack,
      recoverable: true,
      retryable: this.isDatabaseErrorRetryable(error),
      userMessage: 'A database error occurred. Please try again in a moment.',
      technicalDetails: `Database error: ${error.message}`,
      suggestedActions: this.getDatabaseErrorActions(error)
    };
  }

  private static createNetworkError(error: Error, context: ErrorContext): TaskError {
    const errorId = this.generateErrorId();
    
    return {
      id: errorId,
      category: 'network',
      severity: 'medium',
      message: error.message,
      code: ERROR_CODES.NETWORK_TIMEOUT,
      context,
      originalError: error,
      recoverable: true,
      retryable: true,
      userMessage: 'Network connection issue. Please check your connection and try again.',
      technicalDetails: `Network error: ${error.message}`,
      suggestedActions: ['Check internet connection', 'Retry the operation', 'Contact support if problem persists']
    };
  }

  private static createBusinessLogicError(error: Error, context: ErrorContext): TaskError {
    const errorId = this.generateErrorId();
    
    return {
      id: errorId,
      category: 'business_logic',
      severity: 'medium',
      message: error.message,
      code: ERROR_CODES.BUSINESS_TASK_NOT_FOUND,
      context,
      originalError: error,
      recoverable: false,
      retryable: false,
      userMessage: this.getBusinessLogicUserMessage(error),
      technicalDetails: `Business logic error: ${error.message}`,
      suggestedActions: this.getBusinessLogicActions(error)
    };
  }

  private static classifyError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('validation') || message.includes('invalid')) return 'validation';
    if (message.includes('database') || message.includes('connection')) return 'database';
    if (message.includes('network') || message.includes('timeout')) return 'network';
    if (message.includes('auth') || message.includes('permission')) return 'authentication';
    if (message.includes('not found') || message.includes('business')) return 'business_logic';
    
    return 'system';
  }

  private static determineSeverity(category: ErrorCategory, error: Error): ErrorSeverity {
    switch (category) {
      case 'validation': return 'medium';
      case 'database': return this.isDatabaseConnectionError(error) ? 'high' : 'medium';
      case 'network': return 'medium';
      case 'authentication': return 'high';
      case 'business_logic': return 'medium';
      case 'system': return 'high';
      default: return 'medium';
    }
  }

  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static logError(error: TaskError): void {
    const logMessage = `[${error.category.toUpperCase()}] ${error.code}: ${error.message}`;
    
    switch (error.severity) {
      case 'low':
        console.debug(`🔍 ${logMessage}`);
        break;
      case 'medium':
        console.warn(`⚠️ ${logMessage}`);
        break;
      case 'high':
        console.error(`❌ ${logMessage}`);
        break;
      case 'critical':
        console.error(`💥 ${logMessage}`);
        break;
    }
  }

  private static storeErrorHistory(error: TaskError): void {
    const key = error.context.operation;
    const history = this.errorHistory.get(key) || [];
    history.push(error);
    
    // Keep only last 100 errors per operation
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.errorHistory.set(key, history);
  }

  private static determineHandlingStrategy(
    error: TaskError,
    customRetryConfig?: Partial<RetryConfig>
  ): Omit<ErrorHandlingResult, 'metadata'> {
    const config = { ...this.retryConfig, ...customRetryConfig };
    
    const shouldRetry = error.retryable && 
      config.retryableCategories.includes(error.category);
    
    return {
      handled: true,
      recovered: false,
      shouldRetry,
      retryDelay: shouldRetry ? this.calculateRetryDelay(1) : undefined,
      userMessage: error.userMessage,
      logLevel: error.severity === 'critical' ? 'error' : 'warn',
      escalate: error.severity === 'critical'
    };
  }

  private static calculateRetryDelay(attemptNumber: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attemptNumber - 1);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  private static isRecoverable(category: ErrorCategory): boolean {
    return ['database', 'network', 'external_service'].includes(category);
  }

  private static isRetryable(category: ErrorCategory): boolean {
    return ['database', 'network', 'external_service'].includes(category);
  }

  private static generateUserMessage(category: ErrorCategory, error: Error): string {
    switch (category) {
      case 'validation':
        return 'Please check your input and try again.';
      case 'database':
        return 'A temporary issue occurred. Please try again in a moment.';
      case 'network':
        return 'Network connection issue. Please check your connection and try again.';
      case 'authentication':
        return 'Authentication failed. Please log in again.';
      case 'business_logic':
        return 'This operation cannot be completed. Please check the task requirements.';
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  }

  private static generateTechnicalDetails(error: Error): string {
    return `${error.name}: ${error.message}${error.stack ? '\n' + error.stack : ''}`;
  }

  private static generateSuggestedActions(category: ErrorCategory, error: Error): string[] {
    switch (category) {
      case 'validation':
        return ['Review input data', 'Check required fields', 'Verify data formats'];
      case 'database':
        return ['Retry the operation', 'Check database connectivity', 'Review query parameters'];
      case 'network':
        return ['Check internet connection', 'Retry after a moment', 'Verify service availability'];
      default:
        return ['Try again', 'Contact support if problem persists'];
    }
  }

  private static getErrorCode(category: ErrorCategory, error: Error): string {
    // Simplified error code mapping
    switch (category) {
      case 'validation': return ERROR_CODES.VALIDATION_REQUIRED_FIELD;
      case 'database': return ERROR_CODES.DATABASE_CONNECTION_FAILED;
      case 'network': return ERROR_CODES.NETWORK_TIMEOUT;
      case 'authentication': return ERROR_CODES.AUTH_TOKEN_EXPIRED;
      case 'business_logic': return ERROR_CODES.BUSINESS_TASK_NOT_FOUND;
      default: return ERROR_CODES.SYSTEM_SERVICE_UNAVAILABLE;
    }
  }

  private static isDatabaseConnectionError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('connection') || message.includes('connect');
  }

  private static isDatabaseErrorRetryable(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('connection') || message.includes('temporary');
  }

  private static getDatabaseErrorCode(error: Error): string {
    const message = error.message.toLowerCase();
    if (message.includes('timeout')) return ERROR_CODES.DATABASE_QUERY_TIMEOUT;
    if (message.includes('connection')) return ERROR_CODES.DATABASE_CONNECTION_FAILED;
    if (message.includes('constraint')) return ERROR_CODES.DATABASE_CONSTRAINT_VIOLATION;
    return ERROR_CODES.DATABASE_CONNECTION_FAILED;
  }

  private static getDatabaseErrorActions(error: Error): string[] {
    const message = error.message.toLowerCase();
    if (message.includes('timeout')) {
      return ['Optimize query performance', 'Reduce query complexity', 'Check database load'];
    }
    if (message.includes('connection')) {
      return ['Check database connectivity', 'Verify connection settings', 'Restart database service'];
    }
    return ['Retry the operation', 'Check database status', 'Contact database administrator'];
  }

  private static getBusinessLogicUserMessage(error: Error): string {
    const message = error.message.toLowerCase();
    if (message.includes('not found')) {
      return 'The requested task was not found. It may have been deleted or you may not have permission to access it.';
    }
    if (message.includes('dependency')) {
      return 'This task has dependencies that prevent the requested operation.';
    }
    return 'This operation cannot be completed due to business rules.';
  }

  private static getBusinessLogicActions(error: Error): string[] {
    const message = error.message.toLowerCase();
    if (message.includes('not found')) {
      return ['Verify task exists', 'Check permissions', 'Refresh the page'];
    }
    if (message.includes('dependency')) {
      return ['Complete dependent tasks first', 'Review task relationships', 'Contact project manager'];
    }
    return ['Review operation requirements', 'Check task status', 'Contact support'];
  }
}