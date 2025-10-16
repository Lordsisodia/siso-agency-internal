export interface LightWorkSubtask {
  id: string;
  taskId: string;
  title: string;
  text: string;
  completed: boolean;
  priority?: string;
  dueDate?: string;
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface LightWorkTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  originalDate: string;
  currentDate: string;
  taskDate?: string;
  estimatedDuration?: number;
  rollovers: number;
  tags: string[];
  category?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startedAt?: string;
  actualDurationMin?: number;
  timeEstimate?: string;
  dueDate?: string;
  subtasks: LightWorkSubtask[];
}

export interface SupabaseLightWorkSubtaskRow {
  id: string;
  task_id: string;
  title: string;
  text?: string | null;
  completed: boolean;
  priority?: string | null;
  due_date?: string | null;
  estimated_time?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface SupabaseLightWorkTaskRow {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  original_date: string;
  task_date?: string | null;
  estimated_duration?: number | null;
  rollovers?: number | null;
  tags?: string[] | null;
  category?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  started_at?: string | null;
  actual_duration_min?: number | null;
  time_estimate?: string | null;
  due_date?: string | null;
  subtasks?: SupabaseLightWorkSubtaskRow[] | null;
}

export interface SupabaseLightWorkTaskInsert {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  original_date: string;
  task_date?: string | null;
  completed: boolean;
  rollovers: number;
  tags: string[];
  category?: string | null;
  estimated_duration?: number | null;
  due_date?: string | null;
  time_estimate?: string | null;
}

export interface OfflineLightWorkTaskRecord {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  completed: boolean;
  original_date: string;
  task_date: string;
  estimated_duration?: number;
  actual_duration_min?: number;
  xp_reward?: number;
  difficulty?: number;
  complexity?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  _offline_id?: string;
  _needs_sync?: boolean;
  _last_synced?: string;
  _sync_status?: 'pending' | 'syncing' | 'synced' | 'error';
}
