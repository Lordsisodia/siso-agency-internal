import { 
  LayoutDashboard, Users, MessageSquare, UserCheck,
  ListTodo, CalendarClock, CreditCard,
  ClipboardList, Building2, UserCog, FileText,
  ScrollText, Zap, Bot, Database, FolderOpen,
  Lock, Settings, Terminal, Code
} from 'lucide-react';
import { MenuSection } from './types';

export const getAdminMenuSections = (): MenuSection[] => {
  const sections: MenuSection[] = [
    {
      type: 'main',
      href: '/admin',
      icon: LayoutDashboard,
      label: 'Admin Dashboard',
    },
    {
      type: 'section',
      title: 'Client Management',
      icon: Users,
      items: [
        {
          href: '/admin/clients',
          icon: Building2,
          label: 'Clients',
        },
        {
          href: '/admin/outreach',
          icon: MessageSquare,
          label: 'Outreach',
        }
      ]
    },

    {
      type: 'section',
      title: 'Team Operations',
      icon: UserCheck,
      items: [
        {
          href: '/admin/teams',
          icon: UserCog,
          label: 'Teams',
        },
        {
          href: '/admin/tasks',
          icon: ListTodo,
          label: 'Tasks',
        }
      ]
    },
    {
      type: 'section',
      title: 'Project Management',
      icon: FolderOpen,
      items: [
        {
          href: '/admin/plans/create',
          icon: FileText,
          label: 'Plans',
        }
      ]
    },
    {
      type: 'section',
      title: 'Automation Tools',
      icon: Zap,
      items: [
        {
          href: '/admin/prompts',
          icon: Database,
          label: 'Prompt Manager',
        },
        {
          href: '/admin/templates',
          icon: FileText,
          label: 'Templates',
        },
        {
          href: '/admin/automation',
          icon: Bot,
          label: 'Automation',
        }
      ]
    },
    {
      type: 'section',
      title: 'Development Tools',
      icon: Code,
      items: [
        {
          href: '/admin/dev-tools',
          icon: Terminal,
          label: 'SISO Dev Tools',
        }
      ]
    },
    {
      type: 'section',
      title: 'Business Tools',
      icon: ScrollText,
      items: [
        {
          href: '/admin/daily-planner',
          icon: CalendarClock,
          label: 'Daily Planner',
        },
        {
          href: '/admin/life-lock',
          icon: Lock,
          label: 'Life Lock',
        },
        {
          href: '/admin/payments',
          icon: CreditCard,
          label: 'Financials',
        }
      ]
    },
    {
      type: 'section',
      title: 'System',
      icon: Settings,
      items: [
        {
          href: '/changelog',
          icon: ClipboardList,
          label: 'Changelog',
        }
      ]
    }
  ];

  return sections;
};
