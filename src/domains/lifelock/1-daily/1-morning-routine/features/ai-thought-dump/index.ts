/**
 * AI Thought Dump Feature - Public API
 * 
 * All external code should import from this file only.
 * Internal implementation details are kept private.
 */

// Components
export { SimpleThoughtDumpPage } from './components/SimpleThoughtDumpPage';
export { ThoughtDumpResults } from './components/ThoughtDumpResults';

// Services (only expose what's needed externally)
export { voiceService } from '@/domains/lifelock/services';  // Re-export shared service
export { lifeLockVoiceTaskProcessor } from './services/ai/taskProcessor.service';

// Types
export type { Message, ThoughtDumpResult, ThoughtDumpSession } from './types';

// Constants (if needed externally)
export { FEATURE_NAME, FEATURE_ICON } from './config/constants';
