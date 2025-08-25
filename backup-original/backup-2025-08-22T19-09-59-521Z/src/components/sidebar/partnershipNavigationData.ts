import { 
  LayoutDashboard, Users, Trophy, BarChart3, Activity, 
  BookOpen, FileText, Zap, HelpCircle, Target,
  TrendingUp, Home, Link
} from 'lucide-react';
import { MenuSection } from './types';

export const getPartnershipMenuSections = (): MenuSection[] => {
  const sections: MenuSection[] = [
    {
      type: 'main',
      href: '/partner',
      icon: Home,
      label: 'Partner Dashboard',
    },
    {
      type: 'section',
      title: 'Growth Tools',
      icon: Zap,
      items: [
        {
          href: '/partner/app-plan-generator',
          icon: Target,
          label: 'App Plan Generator',
          badge: 'Most Important'
        },
        {
          href: '/partner/training-hub',
          icon: BookOpen,
          label: 'Training Hub',
        },
        {
          href: '/partner/support',
          icon: HelpCircle,
          label: 'Support',
        }
      ]
    },
    {
      type: 'section',
      title: 'Client Management',
      icon: Users,
      items: [
        {
          href: '/partner/clients',
          icon: Users,
          label: 'Clients',
        },
        {
          href: '/partner/referrals',
          icon: Activity,
          label: 'Referrals',
        }
      ]
    },
    {
      type: 'section',
      title: 'Performance',
      icon: TrendingUp,
      items: [
        {
          href: '/partner/leaderboard',
          icon: Trophy,
          label: 'Leaderboard',
        }
      ]
    }
  ];

  return sections;
};