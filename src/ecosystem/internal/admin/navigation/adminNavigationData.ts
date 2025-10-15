import {
  LayoutDashboard, Users, UserCheck,
  ListTodo, Building2,
  Lock, ShoppingCart, Calendar, CalendarRange,
  CalendarClock, CalendarDays, Infinity
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
        }
      ]
    },
    {
      type: 'section',
      title: 'Team Operations',
      icon: UserCheck,
      items: [
        {
          href: '/admin/tasks',
          icon: ListTodo,
          label: 'Tasks',
        }
      ]
    },
    {
      type: 'section',
      title: 'LifeLock',
      icon: Lock,
      items: [
        {
          href: '/admin/lifelock/daily',
          icon: Calendar,
          label: 'Daily View',
        },
        {
          href: '/admin/lifelock/weekly',
          icon: CalendarRange,
          label: 'Weekly View',
        },
        {
          href: '/admin/lifelock/monthly',
          icon: CalendarClock,
          label: 'Monthly View',
        },
        {
          href: '/admin/lifelock/yearly',
          icon: CalendarDays,
          label: 'Yearly View',
        },
        {
          href: '/admin/lifelock/life',
          icon: Infinity,
          label: 'Life View',
        },
        {
          href: '/xp-store',
          icon: ShoppingCart,
          label: 'XP Store',
        }
      ]
    }
  ];

  return sections;
};
