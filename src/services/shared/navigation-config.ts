/**
 * NAVIGATION CONFIGURATION - Consolidated Bottom Navigation
 *
 * Defines the 5-button navigation structure for Daily View
 * 1. Plan (Timebox, Morning, Checkout)
 * 2. Tasks (Today, Light Work, Deep Work)
 * 3. Health (wellness features)
 * 4. Diet (nutrition tracking)
 * 5. Timeline (contextual: Weekly/Monthly/Yearly/Life)
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
  Calendar as CalendarIcon,
  Apple,
  Timeline
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

// Main Navigation Sections (Bottom Nav Buttons 1-4)
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'plan',
    name: 'Plan',
    icon: Calendar,
    color: 'text-purple-400',
    bgActive: 'bg-purple-400/20',
    hasSubNav: true,
    subSections: [
      { id: 'morning', name: 'Morning', icon: Sunrise },
      { id: 'timebox', name: 'Timebox', icon: Calendar },
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
    id: 'health',
    name: 'Health',
    icon: Heart,
    color: 'text-blue-400',
    bgActive: 'bg-blue-400/20',
    hasSubNav: true,
    subSections: [
      { id: 'water', name: 'Water', icon: Heart },
      { id: 'fitness', name: 'Fitness', icon: Heart },
      { id: 'smoking', name: 'Smoking', icon: Heart }
    ]
  },
  {
    id: 'diet',
    name: 'Diet',
    icon: Apple,
    color: 'text-green-400',
    bgActive: 'bg-green-400/20'
  }
];

// Smart View Navigator - Contextual based on current view (Button 5 - Timeline)
export const VIEW_NAVIGATOR_MAP: Record<string, { label: string; path: string; icon: LucideIcon }> = {
  'daily': { label: 'Weekly', path: '/admin/lifelock/weekly', icon: CalendarDays },
  'weekly': { label: 'Monthly', path: '/admin/lifelock/monthly', icon: CalendarRange },
  'monthly': { label: 'Yearly', path: '/admin/lifelock/yearly', icon: CalendarClock },
  'yearly': { label: 'Life', path: '/admin/lifelock', icon: Sparkles },
  'life': { label: 'Daily', path: '/admin/lifelock/daily', icon: Calendar }
};

// Explore Menu Items (Removed - now using Grid Menu for everything)
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
// │ XP Hub  │ Clients │ Daily   │
// ├─────────┼─────────┼─────────┤
// │Partners │ AI LEGACY│ Weekly │
// ├─────────┼─────────┼─────────┤
// │ Life    │ Yearly  │ Monthly │
// └─────────┴─────────┴─────────┘
export const GRID_MENU_ITEMS: GridMenuItem[] = [
  // Top Row
  { id: 'xp-hub', label: 'XP Hub', path: '/xp-dashboard', icon: Trophy, position: 0, color: 'text-yellow-400' },
  { id: 'clients', label: 'Clients', path: '/admin/clients', icon: Building2, position: 1, color: 'text-amber-400' },
  { id: 'daily-view', label: 'Daily', path: '/admin/lifelock/daily', icon: CalendarIcon, position: 2, color: 'text-blue-400' },

  // Middle Row
  { id: 'partners', label: 'Partners', path: '/admin/partners', icon: Handshake, position: 3, color: 'text-cyan-400' },
  { id: 'ai-legacy', label: 'AI Legacy', path: '/ai-assistant', icon: Sparkles, position: 4, isSpecial: true, color: 'text-purple-400' },
  { id: 'weekly-view', label: 'Weekly', path: '/admin/lifelock/weekly', icon: CalendarDays, position: 5, color: 'text-green-400' },

  // Bottom Row
  { id: 'life-view', label: 'Life', path: '/admin/lifelock/life', icon: InfinityIcon, position: 6, color: 'text-pink-400' },
  { id: 'yearly-view', label: 'Yearly', path: '/admin/lifelock/yearly', icon: CalendarClock, position: 7, color: 'text-red-400' },
  { id: 'monthly-view', label: 'Monthly', path: '/admin/lifelock/monthly', icon: CalendarRange, position: 8, color: 'text-purple-400' }
];

// Map old tabs to new structure for backward compatibility
export const LEGACY_TAB_MAPPING: Record<string, { section: string; subtab?: string }> = {
  'morning': { section: 'plan', subtab: 'morning' },
  'light-work': { section: 'tasks', subtab: 'light-work' },
  'work': { section: 'tasks', subtab: 'deep-work' }, // Legacy 'work' tab maps to 'deep-work' subtab
  'deep-work': { section: 'tasks', subtab: 'deep-work' }, // Direct mapping
  'wellness': { section: 'health' },
  'tasks': { section: 'tasks', subtab: 'tasks' },
  'timebox': { section: 'plan', subtab: 'timebox' },
  'checkout': { section: 'plan', subtab: 'checkout' }
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
