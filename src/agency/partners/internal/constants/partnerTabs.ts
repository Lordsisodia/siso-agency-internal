import { LayoutDashboard, CheckSquare, Share2, FileText, Activity } from 'lucide-react';
import type { PartnerTabConfig } from '../types/partner.types';

export const PARTNER_TAB_OPTIONS: PartnerTabConfig[] = [
  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  { value: 'tasks', label: 'Tasks', icon: CheckSquare },
  { value: 'referrals', label: 'Referrals', icon: Share2 },
  { value: 'docs', label: 'Docs', icon: FileText },
  { value: 'activity', label: 'Activity', icon: Activity },
];
