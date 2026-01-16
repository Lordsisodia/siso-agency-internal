/**
 * SMOKING TAB CONFIGURATION
 *
 * Smoking cessation tracking with daily logging, streak tracking, and analytics.
 * Part of the Health & Wellness section.
 */

import { Heart } from 'lucide-react';
import { SmokingTracker } from '@/domains/lifelock/1-daily/5-wellness/ui/components/SmokingTracker';

const smokingTabConfig = {
  id: 'smoking',
  label: 'Smoking',
  icon: Heart,
  component: SmokingTracker,
  order: 50,
  enabled: true,
  environment: 'both' as const,
  theme: {
    primary: 'text-purple-400',
    background: 'bg-purple-950/20',
    border: 'border-purple-500/30',
    gradient: 'from-purple-500 to-pink-500'
  },
  accessibility: {
    ariaLabel: 'Smoking Cessation Tracker',
    description: 'Track daily cigarette consumption, monitor smoke-free streaks, and view analytics'
  },
  permissions: ['user', 'admin'],
  features: ['offline-sync', 'swipe-gestures', 'daily-tracking'],
  timeRange: {
    start: 6,
    end: 22,
    priority: 5
  },
  timeRelevance: [6, 7, 8, 12, 18, 19],
  color: 'from-purple-500 to-pink-500',
  description: 'Smoking cessation tracking with streaks and analytics',
  componentPath: 'SmokingTracker',
  category: 'health',
  metadata: {
    requiresAuth: true,
    supportsOffline: true,
    hasAnalytics: true,
    gamificationEnabled: true
  }
};

export default smokingTabConfig;
