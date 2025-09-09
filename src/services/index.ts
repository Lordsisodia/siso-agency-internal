// SISO Internal Services - Clean Barrel Exports
// Centralized service access for the SISO Internal application

// Core Business Services
export * from './core/auth.service';
export * from './core/data.service';
export * from './core/ai.service';
export * from './core/task.service';
export * from './core/user.service';
export * from './core/sync.service';
export * from './core/system.service';
export * from './core/workflow.service';

// Utility Services
export * from './utils/api-client';
export * from './utils/api';
export * from './utils/api.types';

// Service Organization:
// - core/: SISO business logic services
// - utils/: HTTP clients and API utilities
// - All external API services removed (Claude, Claudia, etc.)