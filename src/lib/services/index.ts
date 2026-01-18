/**
 * Services Module
 *
 * Central exports for all service integrations.
 */

// API exports
export { api } from './api/claudia-api';
export { autonomousApi } from './api/autonomous-api';

// Supabase exports
export {
  getSupabaseBrowserClient,
  supabaseAnon,
  useSupabaseUserId,
  useSupabaseClient,
  type Database
} from './supabase';

// Workflow exports
export { ClaudeWorkflowEngine } from './workflows/claude-workflow-engine';
export { ClaudeWorkflowManager } from './workflows/claude-workflow-manager';
export { SmartContinuation } from './workflows/smart-continuation';
export { autoContinue } from './workflows/auto-continuation';
export { ResultAnalyzer } from './workflows/result-analyzer';
