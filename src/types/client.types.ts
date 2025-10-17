export interface ClientDocument {
  id: string;
  client_id: string;
  title: string;
  content: string;
  document_type: 'app_plan' | 'functionalities' | 'wireframes' | 'inspiration';
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_edited_by?: string;
  is_pinned?: boolean;
  position?: number;
}

export type ClientStatus =
  | 'potential'
  | 'onboarding'
  | 'active'
  | 'completed'
  | 'archived';

export interface OnboardingProgress {
  initial_contact: boolean;
  talked_to: boolean;
  proposal_created: boolean;
  quote_given: boolean;
  mvp_created: boolean;
  deposit_collected: boolean;
  project_live: boolean;
}

export interface ClientType {
  id: string;
  user_id: string | null;
  name: string;
  is_system: boolean;
  created_at: string;
}

export interface ClientTask {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ClientData {
  id: string;
  full_name: string;
  email: string | null;
  business_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: ClientStatus | string;
  progress?: string | null;
  current_step: number;
  total_steps: number;
  completed_steps: string[];
  created_at: string;
  updated_at: string;
  website_url?: string | null;
  professional_role?: string | null;
  bio?: string | null;
  project_name?: string | null;
  company_niche?: string | null;
  development_url?: string | null;
  mvp_build_status?: string | null;
  notion_plan_url?: string | null;
  payment_status?: string | null;
  estimated_price?: number | null;
  initial_contact_date?: string | null;
  start_date?: string | null;
  estimated_completion_date?: string | null;
  todos?: TodoItem[];
  next_steps?: string | null;
  key_research?: string | null;
  priority?: string | null;
  contact_name?: string | null;
  company_name?: string | null;
  type?: string | null;
  brief?: string | null;
  onboarding_progress?: OnboardingProgress | null;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  related_to?: string;
  assigned_to?: string;
}

export interface ClientsListParams {
  searchQuery?: string;
  statusFilter?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ClientsListResponse {
  clients: ClientData[];
  totalCount: number;
}

export interface ClientColumnPreference {
  key: string;
  label: string;
  visible: boolean;
  width?: number;
  pinned?: boolean;
}

export interface ClientViewPreference {
  columns: ClientColumnPreference[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  pageSize: number;
  showAllColumns?: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  preference: ClientViewPreference;
  isDefault?: boolean;
  createdAt: string;
}
