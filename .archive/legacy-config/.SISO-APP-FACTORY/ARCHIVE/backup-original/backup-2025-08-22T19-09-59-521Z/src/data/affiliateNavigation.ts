import { 
  BarChart3, 
  Trophy, 
  Users, 
  Link, 
  FileText, 
  Zap, 
  GraduationCap, 
  BookOpen, 
  Video, 
  HelpCircle, 
  MessageCircle,
  Home,
  TrendingUp,
  Target
} from 'lucide-react';
import { SidebarConfig, NavigationItem } from '@/components/dashboard/UnifiedSidebar';

export const affiliateNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/partner',
    icon: Home
  },
  {
    name: 'App Plan Generator',
    href: '/partner/app-plan-generator',
    icon: Zap,
    badge: 'Most Important'
  },
  {
    name: 'Training Hub',
    href: '/partner/training-hub',
    icon: BookOpen
  },
  {
    name: 'Support',
    href: '/partner/support',
    icon: HelpCircle
  },
  {
    name: 'Clients',
    href: '/partner/clients',
    icon: Users
  },
  {
    name: 'Referrals',
    href: '/partner/referrals',
    icon: Users
  },
  {
    name: 'Leaderboard',
    href: '/partner/leaderboard',
    icon: Trophy
  },
  {
    name: 'Templates',
    href: '/partner/templates',
    icon: FileText
  }
];

export const getAffiliateSidebarConfig = (
  userName: string = 'Partner',
  userEmail: string = 'partner@example.com'
): SidebarConfig => ({
  title: 'SISO Partner Portal',
  logo: {
    icon: Target,
    text: 'Partner Portal',
    bgColor: 'bg-orange-600'
  },
  navigation: affiliateNavigationItems,
  user: {
    name: userName,
    email: userEmail,
    role: 'Affiliate Partner'
  },
  stats: {
    title: 'This Month',
    value: '£0',
    subtitle: 'Commission Earned',
    icon: Target
  },
  theme: {
    bgColor: 'bg-black',
    borderColor: 'border-orange-500/20',
    textColor: 'text-white',
    accentColor: 'bg-orange-600'
  }
}); 