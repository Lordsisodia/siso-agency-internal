/**
 * NAVIGATION CONFIGURATION - Consolidated Bottom Navigation
 *
 * Defines the 4-button + More navigation structure for Daily View
 * consolidates 7 tabs into logical groupings with sub-navigation
 */

import { LucideIcon } from 'lucide-react';
import {
  Calendar,
  ListChecks,
  Heart,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Sparkles,
  Grid2x2,
  Users,
  Handshake,
  Trophy,
  ShoppingBag,
  Sunrise,
  Moon,
  Coffee,
  Zap,
  Building2,
  LayoutDashboard,
  Infinity as InfinityIcon,
  Calendar as CalendarIcon
} from 'lucide-react';

// Types
export interface NavSection {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bgActive: string;
  hasSubNav?: boolean;
  subSections?: NavSubSection[];
}

export interface NavSubSection {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface MoreMenuItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface GridMenuItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  position: number; // 0-8 for 3x3 grid
  isSpecial?: boolean; // For center AI Legacy button
  color?: string; // Optional color scheme
}

// Main Navigation Sections (Bottom Nav Buttons 1-3)
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'timebox',
    name: 'Timebox',
    icon: Calendar,
    color: 'text-purple-400',
    bgActive: 'bg-purple-400/20',
    hasSubNav: true,
    subSections: [
      { id: 'timebox', name: 'Timebox', icon: Calendar },
      { id: 'morning', name: 'Morning', icon: Sunrise },
      { id: 'checkout', name: 'Checkout', icon: Moon }
    ]
  },
  {
    id: 'tasks',
    name: 'Tasks',
    icon: ListChecks,
    color: 'text-amber-400',
    bgActive: 'bg-amber-400/20',
    hasSubNav: true,
    subSections: [
      { id: 'tasks', name: 'Today', icon: ListChecks },
      { id: 'light-work', name: 'Light Work', icon: Coffee },
      { id: 'deep-work', name: 'Deep Work', icon: Zap }
    ]
  },
  {
    id: 'wellness',
    name: 'Wellness',
    icon: Heart,
    color: 'text-red-400',
    bgActive: 'bg-red-400/20'
  }
];

// Smart View Navigator - Contextual based on current view (Button 4)
export const VIEW_NAVIGATOR_MAP: Record<string, { label: string; path: string; icon: LucideIcon }> = {
  'daily': { label: 'Weekly', path: '/admin/lifelock/weekly', icon: CalendarDays },
  'weekly': { label: 'Monthly', path: '/admin/lifelock/monthly', icon: CalendarRange },
  'monthly': { label: 'Yearly', path: '/admin/lifelock/yearly', icon: CalendarClock },
  'yearly': { label: 'Life', path: '/admin/lifelock', icon: Sparkles },
  'life': { label: 'Daily', path: '/admin/lifelock/daily', icon: Calendar }
};

// More Menu Items (Button 5) - Pages NOT in bottom nav
export const MORE_MENU_ITEMS: MoreMenuItem[] = [
  // Main
  { id: 'admin-dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard },

  // Client Management
  { id: 'clients', label: 'Clients', path: '/admin/clients', icon: Building2 },
  { id: 'industries', label: 'Industries', path: '/admin/industries', icon: Building2 },

  // Partner Workspace
  { id: 'partners', label: 'Partners', path: '/admin/partners', icon: Handshake },

  // LifeLock Views
  { id: 'daily-view', label: 'Daily', path: '/admin/lifelock/daily', icon: CalendarIcon },
  { id: 'weekly-view', label: 'Weekly', path: '/admin/lifelock/weekly', icon: CalendarRange },
  { id: 'monthly-view', label: 'Monthly', path: '/admin/lifelock/monthly', icon: CalendarClock },
  { id: 'yearly-view', label: 'Yearly', path: '/admin/lifelock/yearly', icon: CalendarDays },
  { id: 'life-view', label: 'Life', path: '/admin/lifelock/life', icon: InfinityIcon },

  // XP Features
  { id: 'xp-dashboard', label: 'XP Dashboard', path: '/xp-dashboard', icon: Trophy },
  { id: 'xp-store', label: 'XP Store', path: '/xp-store', icon: ShoppingBag }
];

// Grid Menu Items (3x3 Layout) - NEW!
// Layout:
// ┌─────────┬─────────┬─────────┐
// │ Daily   │ Weekly  │ Clients │
// ├─────────┼─────────┼─────────┤
// │ Monthly │ XP Hub  │Partners │
// ├─────────┼─────────┼─────────┤
// │ Yearly  │ Life    │ AI Legacy│
// └─────────┴─────────┴─────────┘
export const GRID_MENU_ITEMS: GridMenuItem[] = [
  // Top Row
  { id: 'daily-view', label: 'Daily', path: '/admin/lifelock/daily', icon: CalendarIcon, position: 0, color: 'text-blue-400' },
  { id: 'weekly-view', label: 'Weekly', path: '/admin/lifelock/weekly', icon: CalendarDays, position: 1, color: 'text-green-400' },
  { id: 'clients', label: 'Clients', path: '/admin/clients', icon: Building2, position: 2, color: 'text-amber-400' },

  // Middle Row
  { id: 'monthly-view', label: 'Monthly', path: '/admin/lifelock/monthly', icon: CalendarRange, position: 3, color: 'text-purple-400' },
  { id: 'xp-hub', label: 'XP Hub', path: '/xp-dashboard', icon: Trophy, position: 4, color: 'text-yellow-400' },
  { id: 'partners', label: 'Partners', path: '/admin/partners', icon: Handshake, position: 5, color: 'text-cyan-400' },

  // Bottom Row
  { id: 'yearly-view', label: 'Yearly', path: '/admin/lifelock/yearly', icon: CalendarClock, position: 6, color: 'text-red-400' },
  { id: 'life-view', label: 'Life', path: '/admin/lifelock/life', icon: InfinityIcon, position: 7, color: 'text-pink-400' },
  { id: 'ai-legacy', label: 'AI Legacy', path: '/ai-assistant', icon: Sparkles, position: 8, isSpecial: true, color: 'text-purple-400' }
];

// Map old tabs to new structure for backward compatibility
export const LEGACY_TAB_MAPPING: Record<string, { section: string; subtab?: string }> = {
  'morning': { section: 'timebox', subtab: 'morning' },
  'light-work': { section: 'tasks', subtab: 'light-work' },
  'work': { section: 'tasks', subtab: 'deep-work' },
  'wellness': { section: 'wellness' },
  'tasks': { section: 'tasks', subtab: 'tasks' },
  'timebox': { section: 'timebox', subtab: 'timebox' },
  'checkout': { section: 'timebox', subtab: 'checkout' }
};

// Helper functions
export const getCurrentViewType = (pathname: string): string => {
  if (pathname.includes('/daily')) return 'daily';
  if (pathname.includes('/weekly')) return 'weekly';
  if (pathname.includes('/monthly')) return 'monthly';
  if (pathname.includes('/yearly')) return 'yearly';
  if (pathname.endsWith('/lifelock') || pathname.endsWith('/life-lock')) return 'life';
  return 'daily';
};

export const getViewNavigator = (pathname: string) => {
  const viewType = getCurrentViewType(pathname);
  return VIEW_NAVIGATOR_MAP[viewType];
};
