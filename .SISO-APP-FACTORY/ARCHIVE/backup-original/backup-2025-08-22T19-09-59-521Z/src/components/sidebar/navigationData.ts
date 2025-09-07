import { 
  LayoutDashboard, ListTodo, MessageSquare, 
  FileText, HelpCircle, 
  ClipboardList, CalendarClock, FlaskConical
} from 'lucide-react';
import { MenuSection } from './types';

export const getMenuSections = (): MenuSection[] => {
  return [
    {
      type: 'main',
      href: '/home',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      type: 'section',
      title: 'Projects & Tasks',
      icon: ListTodo,
      items: [
        {
          href: '/projects/tasks',
          icon: ListTodo,
          label: 'Active Tasks',
        },
        {
          href: '/onboarding-chat',
          icon: MessageSquare,
          label: 'SISO Assistant',
        },
        {
          href: '/projects/timeline',
          icon: CalendarClock,
          label: 'Timeline',
        },
        {
          href: '/projects/plan-features',
          icon: ClipboardList,
          label: 'App Plan',
        },
        {
          href: '/testing',
          icon: FlaskConical,
          label: 'AI Testing'
        }
      ]
    },
    {
      type: 'section',
      title: 'Resources',
      icon: HelpCircle,
      items: [
        {
          href: '/resources',
          icon: HelpCircle,
          label: 'Help & Support',
        },
        {
          href: '/resources/documents',
          icon: FileText,
          label: 'Documents',
        }
      ]
    }
  ];
};