/**
 * 🔄 Supabase Task Service - Updated to use new modular architecture
 * 
 * This file now exports the UnifiedTaskService which provides the exact same interface
 * as the original SupabaseTaskService but with enhanced reliability, caching, and 
 * error handling through the new modular service architecture.
 * 
 * Migration Note:
 * All existing components continue to work without any code changes.
 * The new architecture provides:
 * - Enhanced retry logic for network failures
 * - Intelligent caching to reduce database load  
 * - Better error handling and logging
 * - Specialized validation for different task types
 * - Health monitoring and service metrics
 * 
 * The original service implementation has been decomposed into:
 * - BaseTaskService: Common functionality, retry logic, caching
 * - LightWorkTaskService: Specialized for quick tasks
 * - DeepWorkTaskService: Specialized for complex work
 * - TaskServiceRegistry: Service management and health monitoring
 * - UnifiedTaskService: Migration-compatible interface (this export)
 */

// Export the unified service that maintains exact API compatibility
// while providing the benefits of the new modular architecture
export { supabaseTaskService, UnifiedTaskService as SupabaseTaskService } from './UnifiedTaskService';

// Default export for compatibility with different import patterns
export { default } from './UnifiedTaskService';