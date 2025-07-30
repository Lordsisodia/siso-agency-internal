
import { OutreachAccount } from '@/types/outreach';

export interface OutreachStats {
  total: number;
  contacted: number;
  converted: number;
  pending: number;
  conversionRate: number;
}

export interface LeadTableColumn {
  key: string;
  label: string;
  visible: boolean;
  width?: number;
  pinned?: boolean;
}

export const INITIAL_COLUMNS: LeadTableColumn[] = [
  { key: 'username', label: 'Username', visible: true, width: 150, pinned: true },
  { key: 'full_name', label: 'Name', visible: true, width: 180 },
  { key: 'followers_count', label: 'Followers', visible: true, width: 120 },
  { key: 'following_count', label: 'Following', visible: true, width: 120 },
  { key: 'posts_count', label: 'Posts', visible: true, width: 100 },
  { key: 'bio', label: 'Bio', visible: true, width: 200 },
  { key: 'profile_url', label: 'Profile URL', visible: true, width: 150 },
  { key: 'status', label: 'Status', visible: true, width: 120 },
  { key: 'source', label: 'Source', visible: true, width: 120 },
  { key: 'outreach_account', label: 'Outreach Account', visible: true, width: 150 },
  { key: 'followed', label: 'Followed', visible: true, width: 100 },
  { key: 'commented', label: 'Commented', visible: true, width: 120 },
  { key: 'messaged', label: 'DMed', visible: true, width: 100 },
  { key: 'app_plan_status', label: 'Plan Status', visible: true, width: 130 },
  { key: 'app_plan_url', label: 'Plan URL', visible: false, width: 150 },
  { key: 'last_interaction', label: 'Last Interaction', visible: false, width: 180 },
  { key: 'created_at', label: 'Added Date', visible: true, width: 120 },
  { key: 'assigned_to', label: 'Assigned To', visible: false, width: 150 },
  { key: 'notes', label: 'Notes', visible: false, width: 200 },
];
