/**
 * Resources Domain Types
 */

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  url: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ResourceType = 'document' | 'video' | 'article' | 'tutorial' | 'reference';

export interface Document extends Resource {
  type: 'document';
  fileType: string;
  fileSize: number;
  project?: string;
  uploadedDate: string;
}

export interface Bookmark {
  id: string;
  resourceId: string;
  folder?: string;
  notes?: string;
  createdAt: Date;
}
