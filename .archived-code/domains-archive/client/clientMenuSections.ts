import {
  LayoutDashboard,
  ListTodo,
  FileText,
  Wallet,
  Trophy,
  HelpCircle,
  ClipboardList,
  FileText as Documents,
  CalendarClock,
  MessageSquare,
} from "lucide-react";

export const clientMenuSections = [
  {
    type: 'main',
    href: '/client-dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    type: 'section',
    title: 'Projects & Tasks',
    icon: ListTodo,
    items: [
      {
        href: '/client-dashboard/tasks',
        icon: ListTodo,
        label: 'Active Tasks',
      },
      {
        href: '/onboarding-chat',
        icon: MessageSquare,
        label: 'SISO Assistant',
      },
      {
        href: '/client-dashboard/timeline',
        icon: CalendarClock,
        label: 'Timeline',
      },
      {
        href: '/client-dashboard/plan-features',
        icon: ClipboardList,
        label: 'App Plan',
      }
    ]
  },
  {
    type: 'section',
    title: 'Financial',
    icon: Wallet,
    items: [
      {
        href: '/client-dashboard/financial/payments',
        icon: Wallet,
        label: 'Financial',
      },
      {
        href: '/financial/leaderboards',
        icon: Trophy,
        label: 'Leaderboards',
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
        icon: Documents,
        label: 'Documents',
      }
    ]
  }
];
