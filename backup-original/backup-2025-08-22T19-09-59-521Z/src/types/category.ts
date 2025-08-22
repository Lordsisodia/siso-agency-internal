
// [Analysis] Basic category types
export interface Category {
  id: string;
  name: string;
  description: string;
  image_url?: string;
}

// [Framework] ContentCategory type was moved to complexity.ts for better organization
// This is kept for reference
import { ContentCategory } from './complexity';
export type { ContentCategory };
