export type BlockType = 
  | 'paragraph'
  | 'heading1'
  | 'heading2' 
  | 'heading3'
  | 'bulleted_list'
  | 'numbered_list'
  | 'toggle'
  | 'quote'
  | 'callout'
  | 'code'
  | 'divider'
  | 'table'
  | 'image'
  | 'video'
  | 'embed'
  | 'database';

export interface BlockProperties {
  emoji?: string;        // For callouts
  language?: string;     // For code blocks  
  color?: string;        // For styling
  collapsed?: boolean;   // For toggles
  level?: number;        // For nested lists
  checked?: boolean;     // For todo items
  // Table properties
  columns?: TableColumn[];
  rows?: TableRow[];
  // Media properties
  url?: string;
  caption?: string;
  width?: number;
  height?: number;
  // Database properties
  database_id?: string;
  view_id?: string;
  schema?: DatabaseSchema;
}

// Table-specific types
export interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'checkbox' | 'date';
  width?: number;
  options?: string[]; // For select/multi_select
}

export interface TableRow {
  id: string;
  cells: Record<string, any>;
}

export interface TableCell {
  column_id: string;
  value: any;
  formatted_value?: string;
}

// Database-specific types
export interface DatabaseSchema {
  name: string;
  columns: TableColumn[];
  properties: Record<string, any>;
}

export interface DatabaseRecord {
  id: string;
  properties: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotionBlock {
  id: string;
  type: BlockType;
  content: string;
  properties?: BlockProperties;
  children?: NotionBlock[];
  parent_id?: string;
}

export interface NotionDocument {
  id: string;
  title: string;
  blocks: NotionBlock[];
  created_at: string;
  updated_at: string;
}

export interface InlineStyle {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  link?: string;
}

export interface FormattedText {
  content: string;
  styles?: InlineStyle;
}

export interface ParsedContent {
  blocks: NotionBlock[];
  metadata?: {
    title?: string;
    description?: string;
  };
} 