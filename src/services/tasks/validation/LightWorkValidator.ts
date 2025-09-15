/**
 * 🔍 Light Work Task Validator - Pure validation logic for quick tasks
 * 
 * This module contains ONLY validation rules for light work tasks.
 * Light work tasks are designed for quick execution (5-45 minutes) with
 * minimal friction to encourage rapid task capture and completion.
 * 
 * Validation Philosophy:
 * - Permissive validation to encourage quick task entry
 * - Essential fields only (title, user_id, priority)
 * - Reasonable limits without being restrictive
 * - Clear, actionable error messages
 */

// Input types for validation
export interface CreateLightWorkTaskInput {
  user_id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'Med' | 'HIGH';
  estimated_duration?: number;
  tags?: string[];
  category?: string;
  task_date: string;
}

export interface UpdateLightWorkTaskInput {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'Med' | 'HIGH';
  estimated_duration?: number;
  tags?: string[];
  category?: string;
  task_date?: string;
  completed?: boolean;
}

// Validation result structure
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Light Work Task Validator - focused on permissive, quick validation
 * Designed to minimize friction while ensuring data quality
 */
export class LightWorkValidator {
  // Constants for validation rules
  private static readonly MAX_TITLE_LENGTH = 150;
  private static readonly MAX_DESCRIPTION_LENGTH = 500;
  private static readonly MAX_DURATION_MINUTES = 60;
  private static readonly VALID_PRIORITIES = ['LOW', 'Med', 'HIGH'] as const;
  private static readonly MAX_TAGS = 10;
  private static readonly MAX_TAG_LENGTH = 30;

  /**
   * Validate light work task creation input
   * Returns validation result with errors and warnings
   */
  static validateCreateInput(input: CreateLightWorkTaskInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation - required and reasonable length
    if (!input.title || input.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (input.title.length > this.MAX_TITLE_LENGTH) {
      errors.push(`Title too long (max ${this.MAX_TITLE_LENGTH} characters)`);
    } else if (input.title.length < 3) {
      warnings.push('Very short titles may be unclear');
    }

    // User ID validation - required for data privacy
    if (!input.user_id || input.user_id.trim().length === 0) {
      errors.push('User ID is required');
    }

    // Priority validation - must be valid value
    if (!input.priority || !this.VALID_PRIORITIES.includes(input.priority)) {
      errors.push(`Priority must be one of: ${this.VALID_PRIORITIES.join(', ')}`);
    }

    // Task date validation - required and properly formatted
    if (!input.task_date) {
      errors.push('Task date is required');
    } else if (!this.isValidDate(input.task_date)) {
      errors.push('Task date must be in YYYY-MM-DD format');
    }

    // Optional field validations
    this.validateOptionalFields(input, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate light work task update input
   * Only validates provided fields for partial updates
   */
  static validateUpdateInput(input: UpdateLightWorkTaskInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation if provided
    if (input.title !== undefined) {
      if (!input.title || input.title.trim().length === 0) {
        errors.push('Title cannot be empty');
      } else if (input.title.length > this.MAX_TITLE_LENGTH) {
        errors.push(`Title too long (max ${this.MAX_TITLE_LENGTH} characters)`);
      }
    }

    // Priority validation if provided
    if (input.priority && !this.VALID_PRIORITIES.includes(input.priority)) {
      errors.push(`Priority must be one of: ${this.VALID_PRIORITIES.join(', ')}`);
    }

    // Task date validation if provided
    if (input.task_date && !this.isValidDate(input.task_date)) {
      errors.push('Task date must be in YYYY-MM-DD format');
    }

    // Optional field validations for updates
    this.validateOptionalFields(input, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate optional fields that can appear in both create and update
   * Centralized validation logic for consistency
   */
  private static validateOptionalFields(
    input: CreateLightWorkTaskInput | UpdateLightWorkTaskInput, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Description validation - optional but reasonable length
    if (input.description !== undefined) {
      if (input.description && input.description.length > this.MAX_DESCRIPTION_LENGTH) {
        errors.push(`Description too long (max ${this.MAX_DESCRIPTION_LENGTH} characters)`);
      }
    }

    // Duration validation - warn if too long for light work
    if (input.estimated_duration !== undefined) {
      if (input.estimated_duration && input.estimated_duration < 0) {
        errors.push('Estimated duration cannot be negative');
      } else if (input.estimated_duration && input.estimated_duration > this.MAX_DURATION_MINUTES) {
        warnings.push(`Duration over ${this.MAX_DURATION_MINUTES} minutes - consider deep work instead`);
      } else if (input.estimated_duration && input.estimated_duration > 0 && input.estimated_duration < 5) {
        warnings.push('Very short tasks (under 5 minutes) may not need tracking');
      }
    }

    // Tags validation - reasonable number and length
    if (input.tags !== undefined && input.tags) {
      if (input.tags.length > this.MAX_TAGS) {
        errors.push(`Too many tags (max ${this.MAX_TAGS})`);
      }
      
      const invalidTags = input.tags.filter(tag => 
        !tag || tag.trim().length === 0 || tag.length > this.MAX_TAG_LENGTH
      );
      
      if (invalidTags.length > 0) {
        errors.push(`Invalid tags: empty or longer than ${this.MAX_TAG_LENGTH} characters`);
      }
    }

    // Category validation - reasonable length if provided
    if (input.category !== undefined && input.category) {
      if (input.category.length > 50) {
        errors.push('Category too long (max 50 characters)');
      }
    }
  }

  /**
   * Check if a date string is valid YYYY-MM-DD format
   * Light validation for UI flexibility
   */
  private static isValidDate(dateString: string): boolean {
    // Basic format check
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    // Check if date is parseable
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validate that a task is suitable for light work classification
   * Provides suggestions for task type optimization
   */
  static validateLightWorkSuitability(input: CreateLightWorkTaskInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Duration-based recommendations
    if (input.estimated_duration) {
      if (input.estimated_duration >= 45) {
        warnings.push('Tasks over 45 minutes work better as deep work tasks');
      }
      
      if (input.estimated_duration >= 120) {
        errors.push('Tasks over 2 hours should be deep work tasks');
      }
    }

    // Complexity-based recommendations
    if (input.description && input.description.length > 200) {
      warnings.push('Complex tasks with long descriptions may benefit from deep work classification');
    }

    // Priority-based recommendations  
    if (input.priority === 'HIGH' && input.estimated_duration && input.estimated_duration > 30) {
      warnings.push('High priority tasks over 30 minutes may deserve deep work focus');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Sanitize and normalize input data
   * Ensures consistent data format regardless of input variation
   */
  static sanitizeInput(input: CreateLightWorkTaskInput | UpdateLightWorkTaskInput): typeof input {
    return {
      ...input,
      title: input.title?.trim(),
      description: input.description?.trim() || undefined,
      category: input.category?.trim() || undefined,
      tags: input.tags?.map(tag => tag.trim()).filter(tag => tag.length > 0) || undefined
    };
  }
}