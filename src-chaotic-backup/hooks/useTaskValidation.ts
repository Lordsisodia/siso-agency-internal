/**
 * 🛡️ useTaskValidation Hook - Business Logic & Validation
 * 
 * Provides comprehensive validation for task operations with context-aware
 * rules that differ between light-work and deep-work task types.
 * 
 * Features:
 * - Type-specific validation rules
 * - Real-time field validation
 * - Business logic enforcement
 * - Accessibility-compliant error messages
 * - Performance optimized with memoization
 */

import { useMemo, useCallback } from 'react';
import { Task } from '@/components/tasks/TaskCard';

/**
 * Generic validation rule structure
 */
interface ValidationRule<T> {
  validate: (value: T, context?: ValidationContext) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Validation context for dynamic rule evaluation
 */
interface ValidationContext {
  taskType: 'light-work' | 'deep-work';
  existingTasks?: Task[];
  isEditing?: boolean;
  currentTask?: Task;
}

/**
 * Field-specific validation rules
 */
interface TaskValidationRules {
  title: ValidationRule<string>[];
  description: ValidationRule<string>[];
  priority: ValidationRule<string>[];
  status: ValidationRule<string>[];
  focusIntensity?: ValidationRule<number>[];
  estimatedDuration?: ValidationRule<number>[];
  subtasks?: ValidationRule<any[]>[];
}

/**
 * Validation result structure
 */
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  info: Record<string, string[]>;
}

/**
 * Subtask validation rules (nested validation)
 */
interface SubtaskValidationRules {
  title: ValidationRule<string>[];
  description: ValidationRule<string>[];
  estimatedTime: ValidationRule<string>[];
  priority: ValidationRule<string>[];
}

/**
 * Main task validation hook
 */
export const useTaskValidation = (taskType: 'light-work' | 'deep-work') => {
  
  /**
   * CORE VALIDATION RULES
   * 
   * Defined with useMemo for performance optimization.
   * Rules are context-aware and adapt to task type.
   */
  const validationRules = useMemo((): TaskValidationRules => {
    const baseRules: TaskValidationRules = {
      // Title validation (universal)
      title: [
        {
          validate: (title: string) => title.trim().length > 0,
          message: 'Title is required',
          severity: 'error'
        },
        {
          validate: (title: string) => title.trim().length >= 3,
          message: 'Title must be at least 3 characters',
          severity: 'error'
        },
        {
          validate: (title: string) => title.length <= 100,
          message: 'Title must be 100 characters or less',
          severity: 'error'
        },
        {
          validate: (title: string) => !title.match(/^\s*TODO:?\s*/i),
          message: 'Avoid generic "TODO" titles - be specific about the task',
          severity: 'warning'
        }
      ],

      // Description validation (context-aware)
      description: [
        {
          validate: (description: string, context) => {
            if (context?.taskType === 'deep-work') {
              return description.trim().length > 0;
            }
            return true; // Light work descriptions are optional
          },
          message: 'Deep work tasks require a detailed description',
          severity: 'error'
        },
        {
          validate: (description: string) => description.length <= 500,
          message: 'Description must be 500 characters or less',
          severity: 'error'
        },
        {
          validate: (description: string, context) => {
            if (context?.taskType === 'deep-work' && description.trim().length > 0) {
              return description.trim().length >= 20;
            }
            return true;
          },
          message: 'Deep work descriptions should be detailed (20+ characters)',
          severity: 'warning'
        }
      ],

      // Priority validation
      priority: [
        {
          validate: (priority: string) => ['low', 'medium', 'high'].includes(priority),
          message: 'Priority must be low, medium, or high',
          severity: 'error'
        }
      ],

      // Status validation
      status: [
        {
          validate: (status: string) => 
            ['pending', 'in-progress', 'completed', 'need-help'].includes(status),
          message: 'Invalid task status',
          severity: 'error'
        }
      ]
    };

    // Deep work specific validations
    if (taskType === 'deep-work') {
      // Enhanced title requirements for deep work
      baseRules.title.push({
        validate: (title: string) => title.length >= 10,
        message: 'Deep work tasks should have descriptive titles (10+ characters)',
        severity: 'warning'
      });

      // Focus intensity validation
      baseRules.focusIntensity = [
        {
          validate: (intensity: number) => [1, 2, 3, 4].includes(intensity),
          message: 'Focus intensity must be between 1-4',
          severity: 'error'
        },
        {
          validate: (intensity: number) => intensity >= 2,
          message: 'Deep work typically requires focus intensity of 2 or higher',
          severity: 'info'
        }
      ];

      // Estimated duration validation for deep work
      baseRules.estimatedDuration = [
        {
          validate: (duration: number) => duration > 0,
          message: 'Estimated duration must be positive',
          severity: 'error'
        },
        {
          validate: (duration: number) => duration >= 30,
          message: 'Deep work sessions should be at least 30 minutes',
          severity: 'warning'
        },
        {
          validate: (duration: number) => duration <= 240,
          message: 'Consider breaking tasks longer than 4 hours into smaller chunks',
          severity: 'info'
        }
      ];

      // Subtask validation for deep work
      baseRules.subtasks = [
        {
          validate: (subtasks: any[]) => subtasks.length > 0,
          message: 'Deep work tasks should have at least one subtask for better tracking',
          severity: 'warning'
        },
        {
          validate: (subtasks: any[]) => subtasks.length <= 10,
          message: 'Consider consolidating if you have more than 10 subtasks',
          severity: 'info'
        }
      ];
    }

    // Light work specific validations
    if (taskType === 'light-work') {
      // Estimated duration for light work
      baseRules.estimatedDuration = [
        {
          validate: (duration: number) => duration > 0,
          message: 'Estimated duration must be positive',
          severity: 'error'
        },
        {
          validate: (duration: number) => duration <= 60,
          message: 'Light work tasks are typically under 1 hour',
          severity: 'info'
        }
      ];

      // Subtask validation for light work
      baseRules.subtasks = [
        {
          validate: (subtasks: any[]) => subtasks.length <= 5,
          message: 'Light work tasks work best with 5 or fewer subtasks',
          severity: 'info'
        }
      ];
    }

    return baseRules;
  }, [taskType]);

  /**
   * SUBTASK VALIDATION RULES
   * 
   * Validation rules specific to subtask fields
   */
  const subtaskValidationRules = useMemo((): SubtaskValidationRules => ({
    title: [
      {
        validate: (title: string) => title.trim().length > 0,
        message: 'Subtask title is required',
        severity: 'error'
      },
      {
        validate: (title: string) => title.length <= 80,
        message: 'Subtask title should be 80 characters or less',
        severity: 'error'
      }
    ],

    description: [
      {
        validate: (description: string) => description.length <= 200,
        message: 'Subtask description should be brief (200 characters or less)',
        severity: 'warning'
      }
    ],

    estimatedTime: [
      {
        validate: (timeStr: string) => {
          if (!timeStr) return true; // Optional field
          return /^\d+(min|h|hr|hour|minute)s?$/i.test(timeStr.trim());
        },
        message: 'Use format like "30min", "2h", "1hour"',
        severity: 'warning'
      }
    ],

    priority: [
      {
        validate: (priority: string) => ['low', 'medium', 'high'].includes(priority),
        message: 'Subtask priority must be low, medium, or high',
        severity: 'error'
      }
    ]
  }), []);

  /**
   * BUSINESS LOGIC VALIDATION
   * 
   * Complex validation rules that consider task relationships
   * and business constraints
   */
  const businessRules = useMemo(() => ({
    // Check for duplicate task titles
    checkDuplicateTitle: (title: string, context: ValidationContext): ValidationResult => {
      const duplicateExists = context.existingTasks?.some(
        task => task.title.toLowerCase() === title.toLowerCase() && 
                task.id !== context.currentTask?.id
      );

      return {
        isValid: !duplicateExists,
        errors: duplicateExists ? { title: ['A task with this title already exists'] } : {},
        warnings: {},
        info: {}
      };
    },

    // Validate task dependency logic
    checkDependencies: (task: Task, context: ValidationContext): ValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check if dependencies exist
      if (task.dependencies?.length) {
        const existingTaskIds = context.existingTasks?.map(t => t.id) || [];
        const invalidDeps = task.dependencies.filter(depId => !existingTaskIds.includes(depId));
        
        if (invalidDeps.length > 0) {
          errors.push(`Invalid dependencies: ${invalidDeps.join(', ')}`);
        }
      }

      // Check for circular dependencies (simplified check)
      if (task.dependencies?.includes(task.id)) {
        errors.push('Task cannot depend on itself');
      }

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? { dependencies: errors } : {},
        warnings: warnings.length > 0 ? { dependencies: warnings } : {},
        info: {}
      };
    },

    // Validate focus session requirements
    checkFocusSessionRequirements: (task: Task): ValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const info: string[] = [];

      if (taskType === 'deep-work') {
        // Deep work tasks should have focus intensity
        if (!task.focusIntensity) {
          warnings.push('Consider setting focus intensity for better session planning');
        }

        // Check if subtasks are suitable for focus sessions
        const longSubtasks = task.subtasks?.filter(subtask => {
          const timeMatch = subtask.estimatedTime?.match(/(\d+)/);
          const minutes = timeMatch ? parseInt(timeMatch[1]) : 0;
          return minutes > 90; // More than 1.5 hours
        });

        if (longSubtasks?.length > 0) {
          info.push('Some subtasks are quite long - consider breaking them down further');
        }
      }

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? { focusSession: errors } : {},
        warnings: warnings.length > 0 ? { focusSession: warnings } : {},
        info: info.length > 0 ? { focusSession: info } : {}
      };
    },

    // Validate workload balance
    checkWorkloadBalance: (tasks: Task[]): ValidationResult => {
      const warnings: string[] = [];
      const info: string[] = [];

      const highPriorityCount = tasks.filter(t => t.priority === 'high').length;
      const totalCount = tasks.length;

      if (totalCount > 0) {
        const highPriorityRatio = highPriorityCount / totalCount;
        
        if (highPriorityRatio > 0.7) {
          warnings.push('Most tasks are high priority - consider rebalancing priorities');
        }
        
        if (totalCount > 20) {
          info.push('You have many active tasks - consider archiving completed ones');
        }
      }

      return {
        isValid: true, // Workload balance never prevents saving
        errors: {},
        warnings: warnings.length > 0 ? { workload: warnings } : {},
        info: info.length > 0 ? { workload: info } : {}
      };
    }
  }), [taskType]);

  /**
   * VALIDATION EXECUTION FUNCTIONS
   * 
   * Main validation functions that can be called by components
   */
  
  // Validate a single field
  const validateField = useCallback((
    fieldName: keyof TaskValidationRules,
    value: any,
    context?: ValidationContext
  ): ValidationResult => {
    const fieldRules = validationRules[fieldName];
    if (!fieldRules) {
      return { isValid: true, errors: {}, warnings: {}, info: {} };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];

    fieldRules.forEach(rule => {
      if (!rule.validate(value, context)) {
        switch (rule.severity) {
          case 'error':
            errors.push(rule.message);
            break;
          case 'warning':
            warnings.push(rule.message);
            break;
          case 'info':
            info.push(rule.message);
            break;
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? { [fieldName]: errors } : {},
      warnings: warnings.length > 0 ? { [fieldName]: warnings } : {},
      info: info.length > 0 ? { [fieldName]: info } : {}
    };
  }, [validationRules]);

  // Validate an entire task
  const validateTask = useCallback((
    task: Partial<Task>,
    context: ValidationContext = { taskType }
  ): ValidationResult => {
    const allResults: ValidationResult[] = [];

    // Validate each field
    Object.keys(validationRules).forEach(fieldName => {
      const fieldKey = fieldName as keyof TaskValidationRules;
      const fieldValue = task[fieldKey as keyof Task];
      
      if (fieldValue !== undefined) {
        const result = validateField(fieldKey, fieldValue, context);
        allResults.push(result);
      }
    });

    // Run business logic validations
    if (task.title) {
      allResults.push(businessRules.checkDuplicateTitle(task.title, context));
    }

    if (task as Task) {
      allResults.push(businessRules.checkDependencies(task as Task, context));
      allResults.push(businessRules.checkFocusSessionRequirements(task as Task));
    }

    // Merge all results
    const mergedResult: ValidationResult = {
      isValid: allResults.every(r => r.isValid),
      errors: {},
      warnings: {},
      info: {}
    };

    allResults.forEach(result => {
      Object.assign(mergedResult.errors, result.errors);
      Object.assign(mergedResult.warnings, result.warnings);
      Object.assign(mergedResult.info, result.info);
    });

    return mergedResult;
  }, [validationRules, businessRules, validateField, taskType]);

  // Validate a subtask
  const validateSubtask = useCallback((subtask: any): ValidationResult => {
    const allResults: ValidationResult[] = [];

    Object.keys(subtaskValidationRules).forEach(fieldName => {
      const fieldKey = fieldName as keyof SubtaskValidationRules;
      const fieldRules = subtaskValidationRules[fieldKey];
      const fieldValue = subtask[fieldKey];

      if (fieldValue !== undefined) {
        const errors: string[] = [];
        const warnings: string[] = [];
        const info: string[] = [];

        fieldRules.forEach(rule => {
          if (!rule.validate(fieldValue)) {
            switch (rule.severity) {
              case 'error':
                errors.push(rule.message);
                break;
              case 'warning':
                warnings.push(rule.message);
                break;
              case 'info':
                info.push(rule.message);
                break;
            }
          }
        });

        allResults.push({
          isValid: errors.length === 0,
          errors: errors.length > 0 ? { [fieldKey]: errors } : {},
          warnings: warnings.length > 0 ? { [fieldKey]: warnings } : {},
          info: info.length > 0 ? { [fieldKey]: info } : {}
        });
      }
    });

    // Merge results
    const mergedResult: ValidationResult = {
      isValid: allResults.every(r => r.isValid),
      errors: {},
      warnings: {},
      info: {}
    };

    allResults.forEach(result => {
      Object.assign(mergedResult.errors, result.errors);
      Object.assign(mergedResult.warnings, result.warnings);
      Object.assign(mergedResult.info, result.info);
    });

    return mergedResult;
  }, [subtaskValidationRules]);

  // Quick validation checks
  const quickChecks = {
    isTaskValid: useCallback((task: Partial<Task>, context?: ValidationContext) => {
      return validateTask(task, { taskType, ...context }).isValid;
    }, [validateTask, taskType]),

    isSubtaskValid: useCallback((subtask: any) => {
      return validateSubtask(subtask).isValid;
    }, [validateSubtask]),

    canSaveTask: useCallback((task: Partial<Task>, context?: ValidationContext) => {
      const result = validateTask(task, { taskType, ...context });
      // Can save if no errors (warnings and info don't prevent saving)
      return Object.keys(result.errors).length === 0;
    }, [validateTask, taskType])
  };

  return {
    // Validation functions
    validateField,
    validateTask,
    validateSubtask,
    
    // Quick checks
    ...quickChecks,
    
    // Business logic
    businessRules,
    
    // Rule definitions (for inspection/debugging)
    validationRules,
    subtaskValidationRules,
    
    // Task type
    taskType
  };
};

/**
 * Type exports for external use
 */
export type { 
  ValidationRule, 
  ValidationContext, 
  ValidationResult,
  TaskValidationRules,
  SubtaskValidationRules
};