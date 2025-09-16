/**
 * 🔍 Deep Work Task Validator - Focused validation logic for complex work tasks
 * 
 * This module provides comprehensive validation for deep work tasks and their operations.
 * Deep work tasks are complex, focused activities requiring significant mental effort
 * and typically lasting 45-240 minutes with high cognitive intensity.
 * 
 * Business Context:
 * Deep work validation ensures that complex tasks meet the standards for:
 * - Sustained focus requirements (45+ minutes)
 * - Appropriate cognitive intensity levels (2-3)
 * - Proper subtask decomposition for complex work
 * - Resource and tool validation for deep work contexts
 * 
 * Validation Categories:
 * - Input validation for task creation and updates
 * - Business rules for deep work characteristics
 * - Subtask validation for complex decomposition
 * - Status transition validation for deep work flows
 * - Priority and dependency validation
 */

import { Task } from '@/components/tasks/TaskCard';

// Deep work specific validation constraints
const DEEP_WORK_CONSTRAINTS = {
  MIN_DURATION: 45,           // Minimum 45 minutes for deep work
  MAX_DURATION: 240,          // Maximum 4 hours for single session
  MIN_FOCUS_INTENSITY: 2,     // Minimum cognitive intensity
  MAX_FOCUS_INTENSITY: 3,     // Maximum cognitive intensity
  MAX_SUBTASKS: 8,            // Maximum subtasks for manageable complexity
  MIN_SUBTASKS: 2,            // Minimum subtasks for proper decomposition
  REQUIRED_CONTEXTS: ['development', 'research', 'design', 'analysis', 'writing'],
  MAX_TITLE_LENGTH: 120,      // Longer titles for complex work
  MIN_DESCRIPTION_LENGTH: 50, // Detailed descriptions required
  MAX_DEPENDENCIES: 5         // Limit dependencies for focus
} as const;

// Input types for deep work validation
interface CreateDeepWorkTaskInput {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration?: number;
  focusIntensity?: number;
  context?: string;
  subtasks?: Array<{
    title: string;
    description: string;
    estimatedTime: string;
    priority: 'low' | 'medium' | 'high';
    tools?: string[];
  }>;
  dependencies?: string[];
  tools?: string[];
}

interface UpdateDeepWorkTaskInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked';
  estimatedDuration?: number;
  focusIntensity?: number;
  context?: string;
  completedSubtasks?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Deep Work Task Validator - Ensures complex tasks meet deep work standards.
 * 
 * This validator enforces business rules specific to deep work tasks,
 * ensuring they are properly structured for sustained focus and complex execution.
 * Deep work tasks require higher validation standards due to their complexity.
 */
export class DeepWorkValidator {
  
  /**
   * Validate input for creating a new deep work task.
   * Ensures all required fields are present and meet deep work standards.
   */
  static validateCreateInput(input: CreateDeepWorkTaskInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Required field validation
    if (!input.title?.trim()) {
      errors.push('Title is required for deep work tasks');
    } else if (input.title.length > DEEP_WORK_CONSTRAINTS.MAX_TITLE_LENGTH) {
      errors.push(`Title cannot exceed ${DEEP_WORK_CONSTRAINTS.MAX_TITLE_LENGTH} characters`);
    } else if (input.title.length < 10) {
      warnings.push('Deep work titles should be descriptive (10+ characters)');
    }

    if (!input.description?.trim()) {
      errors.push('Description is required for deep work tasks');
    } else if (input.description.length < DEEP_WORK_CONSTRAINTS.MIN_DESCRIPTION_LENGTH) {
      errors.push(`Deep work description must be at least ${DEEP_WORK_CONSTRAINTS.MIN_DESCRIPTION_LENGTH} characters`);
    }

    // Deep work specific validation
    if (input.estimatedDuration) {
      if (input.estimatedDuration < DEEP_WORK_CONSTRAINTS.MIN_DURATION) {
        errors.push(`Deep work tasks require minimum ${DEEP_WORK_CONSTRAINTS.MIN_DURATION} minutes`);
      } else if (input.estimatedDuration > DEEP_WORK_CONSTRAINTS.MAX_DURATION) {
        warnings.push(`Tasks over ${DEEP_WORK_CONSTRAINTS.MAX_DURATION} minutes should be split into sessions`);
      }
    } else {
      suggestions.push('Consider adding estimated duration for better planning');
    }

    // Focus intensity validation
    if (input.focusIntensity !== undefined) {
      if (input.focusIntensity < DEEP_WORK_CONSTRAINTS.MIN_FOCUS_INTENSITY) {
        warnings.push(`Deep work should have focus intensity ${DEEP_WORK_CONSTRAINTS.MIN_FOCUS_INTENSITY}+`);
      } else if (input.focusIntensity > DEEP_WORK_CONSTRAINTS.MAX_FOCUS_INTENSITY) {
        errors.push(`Focus intensity cannot exceed ${DEEP_WORK_CONSTRAINTS.MAX_FOCUS_INTENSITY}`);
      }
    }

    // Context validation for deep work
    if (input.context && !DEEP_WORK_CONSTRAINTS.REQUIRED_CONTEXTS.includes(input.context)) {
      warnings.push(`Context '${input.context}' may not be suitable for deep work`);
      suggestions.push(`Consider: ${DEEP_WORK_CONSTRAINTS.REQUIRED_CONTEXTS.join(', ')}`);
    }

    // Subtask validation for complex work
    if (input.subtasks) {
      if (input.subtasks.length < DEEP_WORK_CONSTRAINTS.MIN_SUBTASKS) {
        warnings.push(`Deep work should be decomposed into at least ${DEEP_WORK_CONSTRAINTS.MIN_SUBTASKS} subtasks`);
      } else if (input.subtasks.length > DEEP_WORK_CONSTRAINTS.MAX_SUBTASKS) {
        warnings.push(`Consider breaking down into multiple deep work sessions (${DEEP_WORK_CONSTRAINTS.MAX_SUBTASKS}+ subtasks)`);
      }

      // Validate individual subtasks
      input.subtasks.forEach((subtask, index) => {
        if (!subtask.title?.trim()) {
          errors.push(`Subtask ${index + 1} requires a title`);
        }
        if (!subtask.description?.trim()) {
          warnings.push(`Subtask ${index + 1} should have a description for clarity`);
        }
        if (!subtask.estimatedTime) {
          suggestions.push(`Add time estimate for subtask: ${subtask.title}`);
        }
      });
    } else {
      suggestions.push('Break down deep work into focused subtasks for better execution');
    }

    // Dependencies validation
    if (input.dependencies && input.dependencies.length > DEEP_WORK_CONSTRAINTS.MAX_DEPENDENCIES) {
      warnings.push(`Too many dependencies (${input.dependencies.length}) may fragment focus`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate input for updating an existing deep work task.
   * Allows partial updates while maintaining deep work standards.
   */
  static validateUpdateInput(input: UpdateDeepWorkTaskInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate title if provided
    if (input.title !== undefined) {
      if (!input.title.trim()) {
        errors.push('Title cannot be empty');
      } else if (input.title.length > DEEP_WORK_CONSTRAINTS.MAX_TITLE_LENGTH) {
        errors.push(`Title cannot exceed ${DEEP_WORK_CONSTRAINTS.MAX_TITLE_LENGTH} characters`);
      }
    }

    // Validate description if provided
    if (input.description !== undefined) {
      if (!input.description.trim()) {
        errors.push('Description cannot be empty for deep work');
      } else if (input.description.length < DEEP_WORK_CONSTRAINTS.MIN_DESCRIPTION_LENGTH) {
        warnings.push(`Deep work description should be at least ${DEEP_WORK_CONSTRAINTS.MIN_DESCRIPTION_LENGTH} characters`);
      }
    }

    // Validate duration changes
    if (input.estimatedDuration !== undefined) {
      if (input.estimatedDuration < DEEP_WORK_CONSTRAINTS.MIN_DURATION) {
        errors.push(`Deep work requires minimum ${DEEP_WORK_CONSTRAINTS.MIN_DURATION} minutes`);
      } else if (input.estimatedDuration > DEEP_WORK_CONSTRAINTS.MAX_DURATION) {
        warnings.push('Consider breaking into multiple sessions for very long tasks');
      }
    }

    // Validate focus intensity changes
    if (input.focusIntensity !== undefined) {
      if (input.focusIntensity < DEEP_WORK_CONSTRAINTS.MIN_FOCUS_INTENSITY || 
          input.focusIntensity > DEEP_WORK_CONSTRAINTS.MAX_FOCUS_INTENSITY) {
        errors.push(`Focus intensity must be ${DEEP_WORK_CONSTRAINTS.MIN_FOCUS_INTENSITY}-${DEEP_WORK_CONSTRAINTS.MAX_FOCUS_INTENSITY}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate status transitions for deep work tasks.
   * Deep work has specific flow requirements due to context switching costs.
   */
  static validateStatusTransition(
    currentStatus: Task['status'], 
    newStatus: Task['status']
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Define valid transitions for deep work
    const validTransitions: Record<Task['status'], Task['status'][]> = {
      'pending': ['in-progress', 'blocked'],
      'in-progress': ['completed', 'blocked', 'pending'],
      'completed': [], // Completed is final for deep work
      'blocked': ['pending', 'in-progress']
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      errors.push(`Cannot transition from ${currentStatus} to ${newStatus} for deep work`);
    }

    // Deep work specific transition warnings
    if (currentStatus === 'in-progress' && newStatus === 'pending') {
      warnings.push('Pausing deep work may break flow state - consider blocking instead');
    }

    if (currentStatus === 'completed' && newStatus !== 'completed') {
      errors.push('Completed deep work tasks cannot be reopened');
    }

    if (newStatus === 'in-progress') {
      suggestions.push('Ensure distraction-free environment for deep work session');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate the completion of a deep work task.
   * Ensures proper closure and quality standards.
   */
  static validateCompletion(task: Task): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check subtask completion for deep work
    if (task.subtasks && task.subtasks.length > 0) {
      const incompleteSubtasks = task.subtasks.filter(st => st.status !== 'completed');
      
      if (incompleteSubtasks.length > 0) {
        const incompleteCount = incompleteSubtasks.length;
        if (incompleteCount === task.subtasks.length) {
          errors.push('Cannot complete deep work with no finished subtasks');
        } else if (incompleteCount > task.subtasks.length * 0.2) {
          warnings.push(`${incompleteCount} subtasks remain incomplete - ensure quality completion`);
        }
      }
    }

    // Deep work specific completion checks
    if (task.focusIntensity && task.focusIntensity >= 3) {
      suggestions.push('Consider documenting key insights from this high-intensity session');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Get validation constraints for deep work tasks.
   * Useful for UI validation and client-side checks.
   */
  static getConstraints() {
    return DEEP_WORK_CONSTRAINTS;
  }
}