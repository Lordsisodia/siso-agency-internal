
export type WireframeCategory = 'layout' | 'user-flow' | 'component' | 'page';

export interface Wireframe {
  id: string;
  title: string;
  imageUrl: string;
  category: WireframeCategory;
  description?: string;
  project_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  version?: number;
}

export interface WireframeConnection {
  id: string;
  from_wireframe_id: string;
  to_wireframe_id: string;
  label?: string;
  project_id: string;
  created_at?: string;
  updated_at?: string;
  condition?: string;
}
