/**
 * Partnership Components - Barrel Exports
 * 
 * Clean exports for all partnership components extracted from AirtablePartnersTable.tsx refactoring.
 * Enables clean imports and better organization.
 */

export { default as TableToolbar } from './TableToolbar';
export { default as EditableCell } from './EditableCell';
export { default as ContextMenu } from './ContextMenu';
export { default as TableHeader } from './TableHeader';
export { default as TableRow } from './TableRow';
export { default as AirtableStyles } from './AirtableStyles';

// Re-export types for convenience
export type { PartnerProject } from './TableRow';